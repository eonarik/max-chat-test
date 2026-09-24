import spriteRaw from "@/assets/sprites.svg?raw";

export const Sprite = () => (
  <div
    dangerouslySetInnerHTML={{ __html: spriteRaw }}
    style={{ display: "none" }}
  />
);
