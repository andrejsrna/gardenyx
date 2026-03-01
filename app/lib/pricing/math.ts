export const round2 = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

export const grossFromNet = (net: number, vatRate: number) => round2(net * (1 + vatRate));

export const netFromGross = (gross: number, vatRate: number) => round2(gross / (1 + vatRate));

export const taxFromNet = (net: number, vatRate: number) => round2(net * vatRate);

export const taxFromGross = (gross: number, vatRate: number) => round2(gross * (vatRate / (1 + vatRate)));
