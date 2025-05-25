import { useRevalidator } from "react-router";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";

export function useNotifications() {
	const { revalidate } = useRevalidator();

	const query = useInfiniteQuery({
		queryKey: ["notifications"],
		getNextPageParam: (lastPage, pages) =>
			lastPage.length > 0 ? pages.length : undefined,
		initialPageParam: 0,
		queryFn: fetchNotifications,
	});

	const read = useMutation({
		mutationFn: readNotifications,
		onSuccess: async () => {
			await Promise.all([revalidate(), query.refetch()]);
		},
	});

	return {
		query,
		read,
	};
}

async function fetchNotifications({ pageParam }: { pageParam: number }) {
	const res = await fetch(`/notifications?page=${pageParam}`);
	const { notifications } = await res.json();

	return notifications;
}

async function readNotifications(id: number) {
	const res = await fetch(`/notifications/${id}/read`);

	return res.json();
}
