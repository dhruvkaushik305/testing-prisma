import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";
import prisma from "~/db.server";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export async function loader({ context }: Route.LoaderArgs) {
  const newUser = await prisma.user.create({
    data: {},
  });

  console.log(newUser);
  return { message: context.VALUE_FROM_VERCEL };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return <Welcome message={loaderData.message} />;
}
