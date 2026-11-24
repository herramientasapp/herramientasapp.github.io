# Control de soportes 2.0 · Puente de Drive, PWA, paso a IndexedDB y propuestas de mejora

Resultado de aplicar el MD «Seguridad solo para el puente» a `Control_soportes.html` (versión 1), convertirlo en PWA y revisar la app.

---

## 0. ⚠️ Antes de instalar (2 minutos, para no perder datos)

1. **Abre la versión 1 como la usas ahora y pulsa «⬇ Copia (JSON)».** Guarda ese archivo en un sitio seguro. Es tu red de seguridad.
2. **Los datos del navegador van ligados a la dirección, no al archivo.** La 2.0 verá tus datos solo si la abres desde **el mismo sitio** que la versión 1 (por ejemplo, la misma cuenta `…github.io`). Si la abrías como archivo del ordenador (`file://…`) o desde otro dominio, la 2.0 saldrá vacía: no se ha perdido nada. Ve a ⚙️ Ajustes → «Restaurar desde un archivo» y elige el JSON del paso 1 (la 2.0 lee las copias de la versión 1).
3. **Cuando la 2.0 funcione, deja de usar el archivo antiguo.** Si siguieras apuntando cosas en la versión 1, irían a otro sitio y no se verían en la 2.0.

---

## 1. Tus datos NO estaban en IndexedDB → ya está hecho

La versión 1 guardaba **todo en localStorage** (clave `control_soportes_v1`), no en IndexedDB. localStorage es pequeño (unos 5 MB **compartidos con todas tus apps del mismo dominio**) y menos robusto. En la 2.0 lo he pasado a IndexedDB en la misma actualización, de forma segura:

1. La primera vez que abres la 2.0, copia todos los soportes a IndexedDB (base `control_soportes`) **en una sola operación**.
2. Los vuelve a leer y los compara uno a uno con los originales.
3. Si algo no cuadrara, **no usa la copia**: avisa y la app queda en **solo lectura** para que no se mezcle nada.
4. El original de localStorage **no se toca** hasta tu **primera copia de seguridad hecha con la 2.0** (Drive, cifrada o JSON). Entonces se borra solo esa clave; nada de otras apps.

He corregido además un fallo grave de la versión 1: si los datos de localStorage se dañaban, la app arrancaba vacía y **al guardar el siguiente soporte machacaba todo lo anterior**. La 2.0, si encuentra datos dañados, no los toca, avisa y te deja descargarlos tal cual.

---

## 2. Parámetros usados (fila nueva de la tabla de «usados»)

| App | Prefijo SPX | Claves propias | Carpeta Drive | Cabecera MG | Caché SW |
|---|---|---|---|---|---|
| Control de soportes 2.0 | `cs` | `cs_pte` (localStorage, cifrado), `cs_pte_db` (IndexedDB, clave del dispositivo), IndexedDB `control_soportes` (antes localStorage `control_soportes_v1`) | `Mi unidad/Apps/Backups/controldesoportes` | `CSENC1\n` | `controlsoportes-` |

No coinciden con ninguno de los ya usados (gd, ms, gj, qp, ca, me, gv, th, mu, dv, lr, bt). La app no tenía fases 1-3, así que corresponde este MD. Bloque SP literal, cambiando solo `SPX`, `DAPP` y `MG`. Parámetros criptográficos sin tocar: PBKDF2 con 250 000 iteraciones, AES-GCM 256, trozos de 4 MiB, partes de 3 MiB, `GD-FIN`.

---

## 3. Contraseñas: ninguna en texto claro

- La dirección del puente, la clave del puente y la contraseña de copias se guardan **juntas y cifradas** (AES-GCM) en `localStorage['cs_pte']`.
- La llave para descifrarlas es una **clave del dispositivo no extraíble** en IndexedDB `cs_pte_db`: el navegador la usa, pero nadie puede sacar sus bytes, ni siquiera la propia app.
- **Ninguna viaja por la red.** La clave del puente solo firma las peticiones; la contraseña de copias cifra la copia antes de subirla.
- En Drive solo hay archivos `.gdc` **cifrados**.
- Subir una copia no pide nada. Ver o cambiar el puente, borrar copias de Drive y desconectar piden huella (si la activas) o la contraseña de copias.

**Comprobado**: tras conectar, he buscado la dirección, la clave y la contraseña en todo localStorage y en todas las bases IndexedDB, y **no aparecen**. La clave del dispositivo tiene `extractable: false`.

**Límite honesto**: el navegador separa los datos por dominio, no por app. Si otra app del mismo `github.io` tuviera un fallo, podría **usar** (no leer) esta clave. Por eso he cerrado los agujeros de esta app (punto 5). Las apps más sensibles conviene llevarlas a otra organización de GitHub; esta, por su contenido, puede quedarse donde está.

---

## 4. PWA y desinstalación

Archivos: `index.html`, `sw.js`, `manifest.json`, `icon-192.png`, `icon-512.png` (archivador blanco sobre el azul de la app).

- La app **nunca** vacía localStorage entero ni borra bases de otras apps. Solo borra su propia clave antigua, y solo tras la primera copia.
- El `sw.js` solo borra cachés que empiezan por `controlsoportes-` y solo atiende archivos de su carpeta.

| Dónde | Al desinstalar la PWA |
|---|---|
| **Android** | Se quita el icono y **los datos se quedan**. No se borra nada de ninguna app. |
| **Ordenador (Chrome/Edge)** | Sale la casilla **«Borrar también los datos de Chrome»**. **No la marques**: borraría todo el dominio, es decir, todas tus apps. |
| **iPhone** | Cada app de la pantalla de inicio tiene su propio almacenamiento; al borrarla se borra **solo lo suyo**. |

---

## 5. Cambios hechos en la 2.0

- **Datos en IndexedDB** (punto 1). Cada alta, cambio o borrado se guarda de una vez.
- **Copias cifradas en Drive** con el bloque SP, y **aviso al entrar** si pasa 1 mes o hay 1 cambio sin copia (los dos valores se cambian en Ajustes).
- **Nueva página ⚙️ Ajustes** (botón arriba a la derecha) con la tarjeta de Drive, la configuración del aviso, exportar e importar, y el enlace a **💡 Ideas de mejora** (texto con saltos de línea; se puede marcar como implementada, editar y borrar).
- **Restaurar es seguro**: lee y valida la copia entera, descarga una copia previa y sustituye todo en una sola operación. Acepta las copias JSON de la versión 1.
- **Importar (JSON o CSV) descarga antes una copia previa.** Seguía sustituyendo entera la ficha con la misma etiqueta, como en la versión 1, pero ahora con red de seguridad.
- **Seguridad del código**: en la versión 1, un JSON o CSV importado con comillas en el identificador o en el estado podía **ejecutar código** al pintar la lista. Ahora todo se escapa y los clics no llevan datos dentro. Probado con un registro malicioso: no se ejecuta nada.
- **CSV seguro para Excel**: si un texto empieza por `=`, `+`, `-` o `@`, se exporta con un apóstrofo delante para que Excel no lo trate como fórmula. Al reimportar, se quita.
- **La lista sale ordenada por etiqueta** (CD01, CD02… USB07), con orden natural de números.
- El botón «atrás» del móvil cierra Ajustes e Ideas en vez de salir de la app.

---

## 6. Pruebas realizadas

Con una versión 1 de **151 soportes** (comillas, `ñ`, `€`, HTML dentro del texto e identificadores con punto), más uno malicioso:

| Prueba | Resultado |
|---|---|
| Datos idénticos tras pasar de la versión 1 (localStorage) a la 2.0 (IndexedDB) | ✅ 151 de 151 |
| Original de localStorage conservado hasta la primera copia; otras claves intactas | ✅ |
| Registro malicioso → no ejecuta nada | ✅ |
| Editar con el formulario y guardar en IndexedDB; cuenta como cambio | ✅ |
| Ideas con saltos de línea | ✅ |
| Contraseñas en texto claro en localStorage o IndexedDB | ✅ ninguna |
| Copia cifrada: cabecera `CSENC1`, sin texto legible dentro | ✅ |
| Restaurar copia cifrada (con copia previa) | ✅ idéntica |
| Restaurar copia JSON de la versión 1 | ✅ idéntica |
| Importar CSV: actualiza por etiqueta y añade nuevos, con copia previa cifrada | ✅ |
| Exportar → se libera solo la clave antigua de esta app; la de otra app sigue | ✅ |
| Datos antiguos dañados → aviso, no se tocan, se pueden descargar | ✅ |
| Service worker; solo caché `controlsoportes-v2-0`; errores en consola | ✅ ninguno |

**Pendiente (solo tú):** conectar con Drive con tu puente → «Probar y guardar» (debe responder `Apps/Backups/controldesoportes`) → «Subir copia ahora» y comprobar el archivo en Drive. Después, instalarla como app. Desde aquí no hay acceso a Google.

---

## 7. Mi opinión sincera

**Lo bueno.** Es una app pequeña, rápida y enfocada: una ficha por soporte, cuatro estados con contador que también sirve de filtro, y búsqueda en todo. Para un trabajo de meses «a ratos» es justo lo que hace falta: abrir, apuntar y cerrar. El autorrelleno de la fecha al marcar «Volcado» y de la carpeta destino es un buen detalle.

**Lo que más fricción te va a dar** (por orden de impacto; no está programado, espero tu OK):

1. **Cambiar de estado sin abrir la ficha.** El flujo real es Pendiente → Volcado → Ordenado. Un botón en cada tarjeta («→ Volcado» y luego «→ Ordenado») te ahorra abrir, cambiar el desplegable y guardar cientos de veces.
2. **Alta en serie.** Al añadir, sugerir la siguiente etiqueta (después de USB07, USB08) y recordar el último tipo y la última ubicación física. Cuando cataloguas una caja de CDs, cada alta sería escribir el contenido y guardar.
3. **«Guardar y añadir otro»** en el formulario, para meter varios seguidos sin cerrarlo.
4. **Duplicados de etiqueta.** Ahora se pueden crear dos «USB07» sin aviso, y la importación luego actualizaría solo uno. Avisar al guardar.
5. **Barra de progreso** arriba: «312 de 480 soportes ordenados (65 %)». En un proyecto largo motiva mucho ver el avance.
6. **«Verificado» automático.** Si apuntas el tamaño y el número de archivos del origen y del destino, la app puede decir si coinciden, en vez de un Sí/No manual.
7. **Imprimir etiquetas** (USB07, CD03…) en una hoja para pegarlas en los soportes y en las cajas.
8. **Varias ubicaciones del mismo contenido**, porque la «Carpeta destino en A» es solo una (ver punto 8).

---

## 8. ¿Tendrá utilidad cuando acabes? Sí, si cambia de papel

Ahora es un **control de un proyecto** (vaciar soportes en el disco A). Cuando termines, casi todos estarán en «Ordenado» o «Reutilizable» y la app perdería sentido tal cual. Pero tu objetivo era tener **2 o 3 copias de todo** y saber **dónde está cada cosa**, y para eso puede convertirse en tu **inventario permanente de copias de seguridad**:

1. **Soportes vivos en vez de soportes a vaciar**: el disco maestro A, las copias B y C, cada nube (OneDrive, Google Drive, Dropbox), cada ordenador y cada móvil.
2. **Fecha de última sincronización y de última verificación** en cada uno, con aviso: «La copia B lleva 4 meses sin actualizarse». Es el punto débil de casi todas las copias caseras: se hacen una vez y se olvidan.
3. **Mapa de qué está dónde** por bloques («Fotos 2000-2010», «Documentos de casa»…), con una marca por soporte. Así ves si algo tiene una sola copia.
4. **Regla 3-2-1** como indicador: 3 copias, en 2 tipos de soporte, 1 fuera de casa (la otra casa o la nube). La app diría qué bloques la cumplen.
5. **Historial de soportes retirados** (los CDs y USB reutilizados o tirados), por si dentro de un año te preguntas «¿qué había en aquel USB rojo?».
6. Encaja con tu app de **Gestión documental**: esa sabe dónde están los papeles y los objetos; esta sabría dónde están los datos digitales.

Mi recomendación: **no cambies nada de esto todavía**. Usa la 2.0 para terminar el volcado, añade solo las mejoras 1-3 del punto 7 si te molestan las mismas cosas que preveo, y cuando estés cerca del final hacemos la «versión inventario» (los datos de ahora se aprovechan tal cual).
