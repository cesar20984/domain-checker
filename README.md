# lotdom.com

App web minimalista para revisar si dominios estan disponibles por lotes usando RDAP gratis, sin API key.

## Uso

```bash
npm start
```

Luego abre:

```text
http://localhost:3000
```

## Como funciona

- Puedes escribir un nombre por linea o separar varios nombres con comas.
- Si escribes `mi-marca`, la app lo combina con las terminaciones seleccionadas.
- Si escribes `mi-marca.com`, se consulta ese dominio exacto.
- Las terminaciones seleccionadas se guardan automaticamente en `localStorage`.
- Las busquedas recientes y guardadas se guardan localmente en el navegador.
- Puedes borrar busquedas recientes una por una y mantener busquedas importantes guardadas encima del historial reciente.
- La app consulta primero RDAP directo usando el bootstrap oficial de IANA, y luego usa `rdap.org` como respaldo.
- Si RDAP falla o tarda demasiado, usa DNS como fallback: NXDOMAIN se muestra como disponible y registros DNS existentes como ocupado.
- "Incierto" queda reservado para casos donde ni RDAP ni DNS permiten confirmar con suficiente claridad.
