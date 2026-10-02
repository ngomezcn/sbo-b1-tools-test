# Credenciales y metadatos viven en `.sbo-skills/<sistema>/<entorno>/` dentro del repositorio

Cada proyecto pertenece a un único cliente y guarda sus entornos (dev, uat, prod) en una carpeta local del repositorio (`.sbo-skills/<sistema>/<entorno>/`, por ejemplo `.sbo-skills/service-layer/dev/`), ignorada por git, en lugar de en el home del usuario. Así dos proyectos de clientes distintos en la misma máquina no se pisan el `dev` ni el `prod`.
