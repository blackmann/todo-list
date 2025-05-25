import argon2 from "argon2";
import { type FieldValues, useForm } from "react-hook-form";
import {
    type ActionFunctionArgs,
    type LoaderFunctionArgs,
    type MetaFunction,
    redirect,
    useActionData, useLoaderData, useSubmit,
} from "react-router";
import { Button } from "~/components/button";
import { Input } from "~/components/input";
import { checkAuth } from "~/lib/check-auth";
import { authCookie } from "~/lib/cookies.server";
import { prisma } from "~/lib/prisma.server";
import { badRequest } from "~/lib/responses";

export async function loader({ request }: LoaderFunctionArgs) {
	try {
		await checkAuth(request);

		return redirect("/");
	} catch (_) {
		const userCreated = await prisma.user.count();

		return { userCreated };
	}
}

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.json();
	const { username, password } = formData;

	const userCreated = await prisma.user.count();
	if (userCreated === 0) {
		const hashedPassword = await argon2.hash(password);
		const user = await prisma.user.create({
			data: {
				username,
				password: hashedPassword,
				superUser: true,
			},
		});

		return redirect("/", {
			headers: {
				"Set-Cookie": await authCookie.serialize({ userId: user.id }),
			},
		});
	}

	const user = await prisma.user.findUnique({
		where: { username },
	});
	if (!user) {
		return badRequest({ detail: "User not found" });
	}

	const isPasswordValid = await argon2.verify(user.password, password);
	if (!isPasswordValid) {
		return badRequest({ detail: "Incorrect username or password" });
	}

	return redirect("/", {
		headers: {
			"Set-Cookie": await authCookie.serialize({ userId: user.id }),
		},
	});
}

export const meta: MetaFunction = () => {
	return [{ title: "Login" }];
};

export default function Login() {
	const { userCreated } = useLoaderData<typeof loader>();
	const actionData = useActionData<typeof action>();
	const { register, handleSubmit, watch, reset } = useForm();
	const submit = useSubmit();

	const $password = watch("password")?.length || 0;

	function onSubmit(data: FieldValues) {
		submit(JSON.stringify(data), {
			method: "POST",
			encType: "application/json",
			action: "/login",
		});
		reset();
	}

	return (
		<div className="flex h-screen w-screen items-center justify-center">
			<div className="w-74 rounded-lg border border-gray-200 bg-stone-50 dark:(bg-neutral-900 border-neutral-800) shadow-lg -mt-10rem">
				<div className="p-4">
					<h1 className=" font-medium">
						{userCreated ? "Login" : "Super User"}
					</h1>
					<p className="text-sm text-gray-500 mb-2">
						{userCreated
							? "Enter your username and password to continue."
							: "This is a first-time login. Set username and password."}
					</p>
					{actionData?.detail && (
						<p className="text-sm text-rose-500 mb-2">{actionData.detail}</p>
					)}
					<form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
						<Input
							placeholder="username"
							className="font-mono"
							{...register("username", { required: true })}
						/>

						<div className="relative">
							<Input
								type={userCreated ? "password" : "text"}
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
							{!userCreated && (
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

						<Button type="submit">
							Enter <div className="i-lucide-crown" />
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
