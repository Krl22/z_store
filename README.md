# Zeta Dorada — tienda web

Web de la tienda Zeta Dorada: clon del diseño de la app Android (`Krl22/z_store_android`) sobre el mismo
backend de Supabase. Tienda, carrito, checkout por WhatsApp/Yape, perfil con direcciones y panel admin.

React 19 + Vite + Tailwind 4 + supabase-js.

En vivo: https://zeta-dorada-web.carthe5kboy.workers.dev

## Desarrollo

```bash
npm install
npm run dev        # http://localhost:5173
```

Usa las variables de `.env.production` (públicas). Para apuntar a otro proyecto de Supabase en local, crea
`.env.local` a partir de `.env.example`.

## Publicar (Cloudflare)

**Despliegue automático:** cada push a `main` en GitHub (`Krl22/z_store`) se publica solo con Cloudflare
Workers Builds (`npm run build` + `npx wrangler deploy`) en el Worker `zeta-dorada-web`.

Para publicar a mano desde esta PC:

```bash
npm run deploy     # requiere `npx wrangler login` una vez por máquina
```

Las variables `VITE_*` quedan dentro del JavaScript publicado: nunca pongas claves secretas ahí.
