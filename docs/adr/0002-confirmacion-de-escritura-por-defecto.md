---
status: accepted; reinforced by ADR-0008
---

# Las escrituras piden confirmación; la Autoridad total es solo por sesión

Toda operación POST, PATCH o DELETE pide confirmación al desarrollador. Este puede conceder Autoridad total, que caduca al terminar la sesión y que la IA nunca propone. Aunque los desarrolladores operan con manager y tienen juicio técnico, se descartó la escritura libre y la autoridad permanente porque un borrado o cancelación erróneo en un sistema B1 es difícil de revertir.
