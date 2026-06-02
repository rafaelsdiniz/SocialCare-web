"use client";

import { useState } from "react";
import { Botao, Campo, Cartao, Entrada, AreaTexto } from "@/components/ui";
import { useToast } from "@/components/Toast";

export function ContatoForm() {
  const toast = useToast();
  const [enviando, setEnviando] = useState(false);

  function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEnviando(true);
    // Formulário institucional (demonstrativo): a API não expõe endpoint de contato.
    setTimeout(() => {
      setEnviando(false);
      (e.target as HTMLFormElement).reset();
      toast.sucesso("Mensagem enviada! Em breve entraremos em contato.");
    }, 600);
  }

  return (
    <Cartao className="p-6">
      <form onSubmit={enviar} className="space-y-4">
        <Campo label="Nome" obrigatorio>
          <Entrada required name="nome" placeholder="Seu nome" />
        </Campo>
        <Campo label="E-mail" obrigatorio>
          <Entrada required type="email" name="email" placeholder="voce@orgao.gov.br" />
        </Campo>
        <Campo label="Organização">
          <Entrada name="organizacao" placeholder="CRAS, prefeitura, ONG..." />
        </Campo>
        <Campo label="Mensagem" obrigatorio>
          <AreaTexto required name="mensagem" placeholder="Como podemos ajudar?" />
        </Campo>
        <Botao type="submit" carregando={enviando} className="w-full">
          Enviar mensagem
        </Botao>
      </form>
    </Cartao>
  );
}
