import type { LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";
import { tryit } from "radashi";
import { checkAuth } from "~/lib/check-auth";
import { prisma } from "~/lib/prisma.server";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const [err] = await tryit(checkAuth)(request);

  if (err) {
    throw redirect("/auth");
  }

  await prisma.notification.update({
    where: {
      id: Number(params.id),
    },
    data: {
      read: true,
    },
  });

  return { read: true };
};
