import clsx from "clsx";
import { type FieldValues, useForm } from "react-hook-form";
import {
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
	type MetaFunction,
	redirect,
	useActionData,
	useLoaderData,
	useSubmit,
} from "react-router";
import { Button } from "~/components/button";
import { Input } from "~/components/input";
import { createAccount, login } from "~/lib/auth";
import { checkAuth } from "~/lib/check-auth";
import { USERNAME_REGEX } from "~/lib/constants";
import { prisma } from "~/lib/prisma.server";
import { badRequest } from "~/lib/responses";

export async function loader({ request }: LoaderFunctionArgs) {
	try {
		await checkAuth(request);

		return redirect("/");
	} catch (_) {
		const url = new URL(request.url);
		const invite = url.searchParams.get("invite");
		const userCreated = await prisma.user.count();

		let signupAllowed = false;

		if (userCreated === 0) {
			signupAllowed = true;
		} else if (invite) {
			const valid = await prisma.inviteToken.findFirst({
				where: {
					token: invite,
					used: false,
					expiresAt: { gt: new Date() },
				},
			});
			if (valid) signupAllowed = true;
		}

		return { userCreated, signupAllowed, invite };
	}
}

export async function action({ request }: ActionFunctionArgs) {
	const url = new URL(request.url);
	const invite = url.searchParams.get("invite");
	const formData = await request.json();
	const { username, password } = formData;

	if (!username || !password) {
		return badRequest({ detail: "Username and password are required" });
	}

	const userCreated = await prisma.user.count();

	if (userCreated === 0 || invite) {
		return createAccount(username, password, invite);
	}

	return login(username, password);
}

export const meta: MetaFunction = () => {
	return [{ title: "Login" }];
};

export default function Login() {
	const { userCreated, signupAllowed, invite } = useLoaderData<typeof loader>();
	const actionData = useActionData<typeof action>();
	const { register, handleSubmit, watch, reset } = useForm();
	const submit = useSubmit();

	const $password = watch("password")?.length || 0;

	const $username = watch("username") || "";

	const isUsernameValid = USERNAME_REGEX.test($username);

	function onSubmit(data: FieldValues) {
		const actionUrl = invite ? `/login?invite=${invite}` : "/login";

		submit(JSON.stringify(data), {
			method: "POST",
			encType: "application/json",
			action: actionUrl,
		});
	}

	return (
		<div className="flex h-screen w-screen items-center justify-center">
			<div className="w-74 rounded-lg border border-gray-200 bg-stone-50 dark:(bg-neutral-900 border-neutral-800) shadow-lg -mt-10rem">
				<div className="p-4">
					<h1 className="font-medium">
						{userCreated === 0
							? "Create Super User"
							: signupAllowed
								? "Sign Up"
								: "Login"}
					</h1>
					<p className="text-sm text-gray-500 mb-2">
						{userCreated === 0
							? "This is a first-time setup. Create a super user account."
							: signupAllowed
								? "Enter a username and password to create your account."
								: "Enter your username and password to log in."}
					</p>
					{actionData?.detail && (
						<p className="text-sm text-rose-500 mb-2">{actionData.detail}</p>
					)}
					<form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
						<div className="relative">
							<Input
								maxLength={14}
								placeholder="username"
								className="font-mono pr-8"
								{...register("username", {
									required: true,
									pattern: USERNAME_REGEX,
								})}
							/>
							{(userCreated === 0 || signupAllowed) && $username && (
								<span
									className={clsx(
										"absolute right-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full animate-fade-in animate-duration-200 ",
										isUsernameValid ? "bg-green-600" : "bg-red-600",
									)}
									aria-hidden="true"
								/>
							)}
						</div>

						<div className="relative">
							<Input
								type={userCreated === 0 || signupAllowed ? "text" : "password"}
								placeholder="password"
								className="font-mono pr-8"
								{...register("password", {
									required: "Password is required",
									minLength: {
										value: 8,
										message: "Password must be at least 8 characters",
									},
								})}
							/>
							{(userCreated === 0 || signupAllowed) && (
								<span
									className={`
					absolute right-2 top-1/2 -translate-y-1/2
					w-2 h-2 rounded-full
					${$password >= 8 ? "bg-green-600" : "dark:bg-neutral-700 bg-neutral-400"}
					`}
									aria-hidden="true"
								/>
							)}
						</div>

						<Button className="gap-1" type="submit">
							{signupAllowed ? "Sign Up" : "Login"}
							<div
								className={clsx({
									"i-lucide-crown": userCreated === 0,
									"i-lucide-corner-down-left": signupAllowed,
								})}
							/>
						</Button>
					</form>
				</div>

				<div className="border-t dark:border-neutral-800 bg-stone-200/40 dark:bg-neutral-800/30 px-4 py-2 flex justify-end">
					<a
						href="https://github.com/blackmann/todo-list"
						className="flex items-center gap-1 bg-stone-200 dark:bg-neutral-800 px-2 py-1 rounded-xl text-secondary font-mono text-sm font-medium"
						target="_blank"
						rel="noreferrer"
					>
						<div className="i-lucide-github" /> todo-list
					</a>
				</div>
			</div>
		</div>
	);
}
