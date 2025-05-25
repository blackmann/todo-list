import { getInviteLink } from "~/lib/get-invite-link";

export const loader = async () => {
	const token = await getInviteLink();

	return { token };
};
