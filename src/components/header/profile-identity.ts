import personIcon from "../../assets/icons/person.png";
import type { AppSession } from "../../auth";
import { getProfileInitials } from "../../utils/get-profile-initials";

const getProfileName = (session: AppSession): string => {
  const displayName: string = session.displayName.trim();
  if (displayName) return displayName;

  const emailName: string = session.email.split("@", 1)[0]?.trim() ?? "";
  return emailName || "Player";
};

const createAvatarFallback = (profileName: string): HTMLSpanElement => {
  const fallback: HTMLSpanElement = document.createElement("span");
  fallback.className = "profile-identity__fallback";

  const initials: string | undefined = getProfileInitials(profileName);
  if (initials) {
    fallback.textContent = initials;
  } else {
    const genericAvatar: HTMLImageElement = document.createElement("img");
    genericAvatar.className = "profile-identity__generic-avatar";
    genericAvatar.src = personIcon;
    genericAvatar.alt = "";
    fallback.append(genericAvatar);
  }

  return fallback;
};

const addProfilePhoto = (
  avatar: HTMLSpanElement,
  fallback: HTMLSpanElement,
  avatarUrl: string | undefined,
): void => {
  if (!avatarUrl) return;

  const image: HTMLImageElement = document.createElement("img");
  image.className = "profile-identity__image";
  image.alt = "";
  image.addEventListener("load", (): void => fallback.remove(), {
    once: true,
  });
  image.addEventListener("error", (): void => image.remove(), { once: true });
  image.src = avatarUrl;
  avatar.append(image);
};

const createAvatar = (
  profileName: string,
  avatarUrl: string | undefined,
): HTMLSpanElement => {
  const avatar: HTMLSpanElement = document.createElement("span");
  avatar.className = "profile-identity__avatar";
  avatar.setAttribute("aria-hidden", "true");

  const fallback: HTMLSpanElement = createAvatarFallback(profileName);
  avatar.append(fallback);
  addProfilePhoto(avatar, fallback, avatarUrl);

  return avatar;
};

export const createProfileIdentity = (
  session: AppSession,
  className: string,
): HTMLDivElement => {
  const profileName: string = getProfileName(session);
  const profile: HTMLDivElement = document.createElement("div");
  profile.className = className;
  profile.setAttribute("role", "status");

  const name: HTMLSpanElement = document.createElement("span");
  name.className = "profile-identity__name";
  name.textContent = profileName;

  profile.append(name, createAvatar(profileName, session.avatarUrl));

  return profile;
};
