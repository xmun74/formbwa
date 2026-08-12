"""
통합 Mixamo FBX(리그+메시+애니) → 팩터링 자산 분리:
  - rig  : 캐릭터(아마추어+메시, T-포즈 rest, 애니 없음)  → characters/{id}/{id}.glb
  - clip : 스쿼트 애니(아마추어+액션, 메시 없음)          → motions/{exerciseId}.glb

같은 Mixamo 스켈레톤이라 clip을 아무 rig에 그대로 적용 가능(결정 1).
Blender 4.2+/5.x.

실행:
  /Applications/Blender.app/Contents/MacOS/Blender --background --python split.py -- \
    <input.fbx> <rig_out.glb> <clip_out.glb>
"""

import sys

import bpy

argv = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
INPUT, RIG_OUT, CLIP_OUT = argv[0], argv[1], argv[2]


def log(m):
    print(f"[split] {m}")


bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.fbx(
    filepath=INPUT, automatic_bone_orientation=True, global_scale=100.0
)

arm = next(o for o in bpy.context.scene.objects if o.type == "ARMATURE")
meshes = [o for o in bpy.context.scene.objects if o.type == "MESH"]
action = arm.animation_data.action if arm.animation_data else None
log(f"armature={arm.name} meshes={[m.name for m in meshes]} action={action.name if action else None}")


def select_only(objs):
    bpy.ops.object.select_all(action="DESELECT")
    for o in objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]


# --- CLIP: 아마추어 + 액션만 (메시 제외). Mixamo 네이티브 FBX로 rest 포즈 보존 ---
select_only([arm])
bpy.ops.export_scene.fbx(
    filepath=CLIP_OUT,
    use_selection=True,
    object_types={"ARMATURE"},
    bake_anim=True,
    add_leaf_bones=False,
)
log(f"clip → {CLIP_OUT}")

# --- RIG: 아마추어 + 메시, 애니 없음 ---
if arm.animation_data:
    arm.animation_data.action = None
select_only([arm, *meshes])
bpy.ops.export_scene.fbx(
    filepath=RIG_OUT,
    use_selection=True,
    object_types={"ARMATURE", "MESH"},
    bake_anim=False,
    add_leaf_bones=False,
    path_mode="COPY",
    embed_textures=True,  # 텍스처(정체성 색)를 FBX에 임베드
)
log(f"rig → {RIG_OUT}")
log("done ✅")
