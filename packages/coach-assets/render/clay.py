"""
팩터링 클레이 렌더 — rig(캐릭터 GLB) + clip(모션 GLB)을 합성해 mp4로 렌더.
같은 Mixamo 스켈레톤이라 clip 액션을 rig 아마추어에 그대로 적용(결정 1).
Blender 5.x / Cycles.

실행:
  GUI 미리보기(스틸): SPIKE_STILL=1 ... --python clay.py -- <rig.glb> <clip.glb> <out.mp4>
  전체 렌더:          /Applications/Blender.app/Contents/MacOS/Blender --background \
                        --python clay.py -- <rig.glb> <clip.glb> <out.mp4>
산출물: <out.mp4> (SPIKE_STILL이면 <out>_still.png)
"""

import math
import os
import sys

import bpy
from mathutils import Vector

argv = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
RIG, CLIP, OUT_PATH = argv[0], argv[1], argv[2]

# ===== 튜닝 노브 =====
RES_X, RES_Y = 1280, 800
FPS = 30
SAMPLES = 48
CLAY_ROUGHNESS = 0.75
CLAY_SSS = 0.15
BUMP_SCALE = 28.0
BUMP_STRENGTH = 0.07
BG_COLOR = (0.62, 0.80, 0.92)
KEY_ENERGY = 3.0
VIEW_ANGLE_DEG = -45  # ±45=측면45°(앱 촬영각), 부호=바라보는 방향
# ====================


def log(m):
    print(f"[clay] {m}")


bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene

# --- rig (메시+아마추어, rest, 애니 없음) ---
log(f"rig  {RIG}")
bpy.ops.import_scene.fbx(filepath=RIG, automatic_bone_orientation=True)
rig_objs = list(scene.objects)
rig_arm = next(o for o in rig_objs if o.type == "ARMATURE")

# --- clip (아마추어+액션, 메시 없음) → 액션만 뽑아 rig에 적용 ---
log(f"clip {CLIP}")
before = set(bpy.data.actions)
bpy.ops.import_scene.fbx(filepath=CLIP, automatic_bone_orientation=True)
clip_objs = [o for o in scene.objects if o not in rig_objs]
new_actions = [a for a in bpy.data.actions if a not in before]
if not new_actions:
    raise RuntimeError("clip에 액션 없음")
rig_arm.animation_data_create()
rig_arm.animation_data.action = new_actions[0]
# Blender 4.4+ 액션 슬롯: 슬롯이 있으면 첫 슬롯 바인딩
slots = getattr(new_actions[0], "slots", None)
if slots and len(slots) > 0:
    try:
        rig_arm.animation_data.action_slot = slots[0]
    except Exception as e:  # noqa: BLE001
        log(f"slot 바인딩 스킵: {e}")
rig_arm.data.pose_position = "POSE"
for o in clip_objs:
    bpy.data.objects.remove(o, do_unlink=True)
log(f"action={new_actions[0].name} → {rig_arm.name}")

meshes = [o for o in scene.objects if o.type == "MESH"]
if not meshes:
    raise RuntimeError("메시 없음 — rig 확인")


# --- 클레이 머티리얼 (base color 유지, roughness/SSS/지문범프) ---
def clayify(mat):
    if not mat.use_nodes:
        mat.use_nodes = True
    nt = mat.node_tree
    bsdf = next((n for n in nt.nodes if n.type == "BSDF_PRINCIPLED"), None)
    if bsdf is None:
        bsdf = nt.nodes.new("ShaderNodeBsdfPrincipled")
        out = next(
            (n for n in nt.nodes if n.type == "OUTPUT_MATERIAL"),
            nt.nodes.new("ShaderNodeOutputMaterial"),
        )
        nt.links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])

    def setin(name, val):
        if name in bsdf.inputs:
            bsdf.inputs[name].default_value = val

    setin("Roughness", CLAY_ROUGHNESS)
    setin("Subsurface Weight", CLAY_SSS)
    setin("Specular IOR Level", 0.2)
    setin("Metallic", 0.0)
    if not bsdf.inputs["Normal"].links:
        noise = nt.nodes.new("ShaderNodeTexNoise")
        noise.inputs["Scale"].default_value = BUMP_SCALE
        bump = nt.nodes.new("ShaderNodeBump")
        bump.inputs["Strength"].default_value = BUMP_STRENGTH
        nt.links.new(noise.outputs["Fac"], bump.inputs["Height"])
        nt.links.new(bump.outputs["Normal"], bsdf.inputs["Normal"])


mats = {m for obj in meshes for m in obj.data.materials if m}
if not mats:
    m = bpy.data.materials.new("Clay")
    for obj in meshes:
        obj.data.materials.append(m)
    mats = {m}
for m in mats:
    clayify(m)


# --- 바운딩박스 (변형 반영 실측) ---
def world_bbox(objs):
    deps = bpy.context.evaluated_depsgraph_get()
    mn = Vector((1e9, 1e9, 1e9))
    mx = Vector((-1e9, -1e9, -1e9))
    for o in objs:
        ev = o.evaluated_get(deps)
        m = ev.to_mesh()
        for v in m.vertices:
            w = ev.matrix_world @ v.co
            mn = Vector(map(min, mn, w))
            mx = Vector(map(max, mx, w))
        ev.to_mesh_clear()
    return mn, mx


# 프레임 범위 먼저 확정 (bbox를 전 애니 프레임에서 재기 위해)
end = int(scene.frame_end)
_acts = list(bpy.data.actions)
if _acts:
    _e = max(int(a.frame_range[1]) for a in _acts)
    if _e > 1:
        end = _e
scene.frame_start = 1
scene.frame_end = end

# bbox = 전 애니 프레임의 합집합 (한 프레임만 재면 동작 중 잘림 — 서기/앉기/팔뻗기 모두 포함)
mn = Vector((1e9, 1e9, 1e9))
mx = Vector((-1e9, -1e9, -1e9))
for _f in range(scene.frame_start, scene.frame_end + 1):
    scene.frame_set(_f)
    fmn, fmx = world_bbox(meshes)
    mn = Vector(map(min, mn, fmn))
    mx = Vector(map(max, mx, fmx))
# 가장자리 여유 — 발·팔이 프레임에 딱 붙지 않게
pad = max((mx - mn).x, (mx - mn).y, (mx - mn).z) * 0.08
mn -= Vector((pad, pad, pad))
mx += Vector((pad, pad, pad))
center = (mn + mx) / 2
height = (mx - mn).z or 1.0
log(f"bbox(전프레임+pad) size=({(mx - mn).x:.2f},{(mx - mn).y:.2f},{(mx - mn).z:.2f})")

# --- 카메라: 측면45°, 전신 프레이밍 ---
cam_data = bpy.data.cameras.new("Cam")
cam_data.lens = 50
cam_data.clip_start = 0.01
cam_data.clip_end = 100000
cam = bpy.data.objects.new("Cam", cam_data)
scene.collection.objects.link(cam)
# bbox 전체를 감싸게 — 자산 회전/이동에 강건 (최대 치수 기준 거리, 중심 조준)
size = mx - mn
reach = max(size.x, size.y, size.z)
dist = reach * 2.4
ang = math.radians(VIEW_ANGLE_DEG)
aim = center
cam.location = (
    aim.x + math.sin(ang) * dist,
    aim.y - math.cos(ang) * dist,
    aim.z,
)
cam.rotation_euler = (aim - Vector(cam.location)).to_track_quat("-Z", "Y").to_euler()
scene.camera = cam

# --- 조명: sun + world ---
sun_data = bpy.data.lights.new("Sun", "SUN")
sun_data.energy = KEY_ENERGY
sun_data.angle = math.radians(12)
sun = bpy.data.objects.new("Sun", sun_data)
scene.collection.objects.link(sun)
sun.rotation_euler = (math.radians(55), 0, math.radians(30))

world = bpy.data.worlds.new("W")
scene.world = world
world.use_nodes = True
bg = world.node_tree.nodes.get("Background")
if bg:
    bg.inputs["Color"].default_value = (*BG_COLOR, 1.0)
    bg.inputs["Strength"].default_value = 1.0

# --- 렌더 설정 (Cycles, Standard 뷰) ---
scene.render.engine = "CYCLES"
scene.cycles.samples = SAMPLES
scene.cycles.use_denoising = True
scene.view_settings.view_transform = "Standard"
scene.render.resolution_x = RES_X
scene.render.resolution_y = RES_Y
scene.render.fps = FPS

log(f"frames 1..{scene.frame_end}")

if os.environ.get("SPIKE_STILL"):
    scene.frame_set((scene.frame_start + scene.frame_end) // 2)
    scene.render.image_settings.file_format = "PNG"
    scene.render.filepath = OUT_PATH.replace(".mp4", "_still.png")
    bpy.ops.render.render(write_still=True)
    log(f"still ✅ → {scene.render.filepath}")
else:
    import shutil
    import subprocess
    import tempfile

    frames_dir = tempfile.mkdtemp(prefix="clay_frames_")  # public 오염 방지
    scene.render.image_settings.file_format = "PNG"
    scene.render.filepath = os.path.join(frames_dir, "f_")
    bpy.ops.render.render(animation=True)
    ff = shutil.which("ffmpeg")
    if ff:
        subprocess.run([
            ff, "-y", "-framerate", str(FPS),
            "-pattern_type", "glob", "-i", os.path.join(frames_dir, "f_*.png"),
            "-c:v", "libx264", "-pix_fmt", "yuv420p", OUT_PATH,
        ])
        shutil.rmtree(frames_dir, ignore_errors=True)
        log(f"done ✅ → {OUT_PATH}")
    else:
        log(f"프레임만 렌더 → {frames_dir} (ffmpeg 없음)")
