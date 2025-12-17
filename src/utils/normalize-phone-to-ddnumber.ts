export function normalizePhoneToDDNumber(phone: string): string {
    // remove tudo que não for número
    const digits = phone.replace(/\D/g, "");

    // Brasil: DDD (2) + número (8 ou 9)
    if (digits.length < 10 || digits.length > 11) {
        throw new Error("Telefone inválido");
    }

    const ddd = digits.slice(0, 2);
    const number = digits.slice(2);

    // valida celular com 9 dígitos
    if (number.length === 9 && number[0] !== "9") {
        throw new Error("Celular inválido");
    }

    return `+55${ddd}${number}`;
}
