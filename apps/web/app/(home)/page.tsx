import { softwareAppJsonLd } from "@/shared/config";
import { JsonLd } from "@/shared/ui/json-ld";
import { IntroView } from "@/views/intro";

export default function Home() {
  return (
    <>
      <JsonLd data={softwareAppJsonLd} />
      <IntroView />
    </>
  );
}
