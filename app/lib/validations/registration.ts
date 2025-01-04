import { z } from 'zod';

export const registrationSchema = z.object({
  first_name: z.string()
    .min(2, 'Meno musí mať aspoň 2 znaky')
    .max(50, 'Meno môže mať maximálne 50 znakov'),
  
  last_name: z.string()
    .min(2, 'Priezvisko musí mať aspoň 2 znaky')
    .max(50, 'Priezvisko môže mať maximálne 50 znakov'),
  
  email: z.string()
    .email('Neplatný formát emailu')
    .min(5, 'Email musí mať aspoň 5 znakov')
    .max(100, 'Email môže mať maximálne 100 znakov'),
  
  password: z.string()
    .min(8, 'Heslo musí mať aspoň 8 znakov')
    .regex(
      /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/,
      'Heslo musí obsahovať aspoň jedno veľké písmeno, číslo a špeciálny znak'
    ),
  
  confirm_password: z.string(),
  
  consents: z.object({
    terms: z.boolean().refine(val => val === true, 'Musíte súhlasiť s obchodnými podmienkami'),
    privacy: z.boolean().refine(val => val === true, 'Musíte súhlasiť so spracovaním osobných údajov'),
    marketing: z.boolean()
  })
}).refine((data) => data.password === data.confirm_password, {
  message: "Heslá sa nezhodujú",
  path: ["confirm_password"]
});

export type RegistrationData = z.infer<typeof registrationSchema>; 