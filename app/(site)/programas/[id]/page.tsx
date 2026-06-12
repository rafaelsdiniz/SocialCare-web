import type { Metadata } from "next";
import { DetalhePrograma } from "@/components/site/DetalhePrograma";

export const metadata: Metadata = { title: "Programa social" };

export default async function ProgramaDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <DetalhePrograma id={Number(id)} />;
}
