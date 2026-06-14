export const DEFAULT_USER_IMAGE = "/images/default-avatar.svg";
export const DEFAULT_USER_BACKGROUND_IMAGE = "/images/default-background.svg";

export function getUserImageUrl(image: string | null | undefined) {
  return image?.trim() ? image : DEFAULT_USER_IMAGE;
}

export function getUserBackgroundImageUrl(
  backgroundImage: string | null | undefined
) {
  return backgroundImage?.trim()
    ? backgroundImage
    : DEFAULT_USER_BACKGROUND_IMAGE;
}
