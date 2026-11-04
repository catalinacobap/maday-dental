# Estado de reseñas

No hay reseñas individuales verificadas cargadas. El resumen de 4.9 es el dato suministrado por la clínica, no una conexión en vivo.

## Acceso necesario

- Preferido: autorización OAuth del propietario de la ficha verificada para Google Business Profile, alcance `https://www.googleapis.com/auth/business.manage`, identificadores de cuenta y ubicación y acceso al API aprobado. La consulta paginada es `GET https://mybusiness.googleapis.com/v4/accounts/{accountId}/locations/{locationId}/reviews`.
- Alternativa: Places API (New) habilitada, clave restringida en un servidor (nunca en estos archivos públicos) y Place ID confirmado para la clínica. La respuesta de detalles puede incluir hasta cinco reseñas. Antes de publicar, cumplir atribución, políticas de privacidad y restricciones de almacenamiento de Google.
- Sin API: conjunto de reseñas verificadas proporcionado por la clínica y autorizado para publicación. El carrusel actual recibe `VERIFIED_REVIEWS` en `script.js`: cada entrada tiene `name`, `text`, `rating` (1–5), `url`. No agregar muestras ficticias.

Los dos enlaces cortos no pudieron resolverse mediante la herramienta de investigación; no se ha confirmado que correspondan al mismo Place ID. Verificar nombre, dirección y coordenadas antes de importar datos.

## Investigación de candidatos

- https://github.com/deysanjeeb/google-maps-scraper: cinco commits visibles, sin fechas de mantenimiento confirmables en la vista consultada. Selenium y Chrome DevTools con sesión Google. Extrae nombre, texto, estrellas y fecha; el formato documentado no incluye URL individual de reseña. Busca negocios por nombre/listado: requiere verificación adicional de identidad. Depende de selectores y parsing de texto, no ofrece garantías de estabilidad ni autorización de Google. No instalado.
- https://github.com/aroaxinping/google-maps-reviews-scraper: cuatro commits visibles, sin mantenimiento continuo confirmado. Python y navegador con sesión autenticada. Identifica negocio por URL e incluye ID, autor, texto, rating y fechas estimadas. Intercepta `batchexecute`, conserva tokens de sesión y usa técnicas anti-detección. Incompatible con las restricciones de este proyecto; no instalado ni ejecutado.

Una licencia MIT autoriza el código del repositorio; no concede permisos sobre los datos de Google ni valida su método de extracción.

Referencias oficiales:
- https://developers.google.com/my-business/reference/rest/v4/accounts.locations.reviews/list
- https://developers.google.com/maps/documentation/places/web-service/policies

El proyecto es estático. La integración en vivo requiere un endpoint de servidor autorizado; no presentar una variable vacía como integración terminada.
