---
status: accepted; extended by ADR-0012 (se aplica a `request`: todo lo que no es GET)
---

# Las escrituras son en seco por defecto

POST, PATCH y DELETE del plugin de uso no se envían a menos que la llamada lleve `--execute`: sin él solo imprimen la petición exacta que se enviaría. La IA se la enseña al desarrollador y repite con `--execute` tras su aprobación; ese comando no está en la lista de permitidos, así que el permiso de Claude Code lo vuelve a pedir. La Autoridad total (por sesión, nunca propuesta por la IA) depende de la IA, no del script, y `prod` exige además una marca explícita en la llamada. El plugin envía exactamente lo que se le pide y no añade ETag ni `If-Match`. Se descartó confiar solo en que la IA pida confirmación (ADR 0002) porque un fallo de la IA se convertiría en un borrado real; con el modo en seco la protección está en el script y el permiso. Concreta y refuerza el ADR 0002.
