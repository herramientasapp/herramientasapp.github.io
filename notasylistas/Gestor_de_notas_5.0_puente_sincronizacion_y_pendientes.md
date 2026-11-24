# Gestor de notas 5.0 · Puente de Drive, sincronización entre dispositivos y mejoras

Resultado de aplicar el MD «Seguridad solo para el puente» al Gestor de notas 4.2, convertirlo en PWA e implementar todas las mejoras acordadas. Al final, lo que queda pendiente.

---

## 0. Antes de instalar (2 minutos)

1. En la 4.2: **⚙ Ajustes → Descargar copia JSON**. Guárdala: es tu red de seguridad.
2. Sube los archivos del zip a **la misma carpeta** de siempre (misma dirección) para que la 5.0 abra tus notas. Si cambias de sitio, la app saldrá vacía: restaura el JSON del paso 1 desde Ajustes.
3. Cierra la pestaña de la 4.2 antes de abrir la 5.0 (si sigue abierta, la 5.0 avisa y no toca nada).
4. Conecta Drive **en el PC y en el móvil** con la misma dirección, clave del puente y contraseña de copias. Desde ese momento se sincronizan solos.

---

## 1. Librerías externas: eliminadas

La 4.2 cargaba **Dexie desde internet** (cdn.jsdelivr.net) cada vez que se abría. Ese código ajeno se ejecutaba con los mismos permisos que la app; con la conexión a Drive dentro, era un riesgo. Además, sin conexión la app no arrancaba.

La 5.0 usa **directamente la base de datos del navegador** (lo mismo que hacía Dexie por debajo). Sigue siendo la **misma base `notario_v3`**: solo se le **añaden** dos almacenes nuevos (`ideas` y `meta`), sin tocar los existentes. La política de seguridad (CSP) impide cargar código de fuera: la app solo puede hablar con el puente de Google.

---

## 2. ¿Estaba todo en IndexedDB?

| Dato | 4.2 | 5.0 |
|---|---|---|
| Notas, listas, papelera, escenarios | IndexedDB `notario_v3` | igual (los escenarios ahora se llaman **etiquetas**) |
| Tema, tamaño de letra, fecha de la última copia | **localStorage** (`tema`, `fuente`, `lastExport`) | **IndexedDB** (almacén `meta`) |

Las claves `tema`, `fuente` y `lastExport` de localStorage **se leen pero no se borran**: son nombres tan genéricos que otra app del mismo dominio podría usarlos, y borrarlos podría estropearla. Ocupan unos pocos bytes.

---

## 3. Tus notas: qué se ha hecho con ellas

**Antes de tocar nada**, la 5.0 guarda dentro de la app una **copia intacta de todas tus notas tal como estaban** (Ajustes → «⬇ Copia de antes de la versión 5»). Después convierte el texto, y lo hace todo en **una sola operación**: si algo fallara, no se cambia nada.

- **Barras invertidas acumuladas y enlaces rotos** (el fallo del editor de la 4.2): se limpian. Ejemplo real de la prueba: `leche \\\\\\\(2 litros\\\\\\\)` y un enlace anidado tres veces quedan como `leche (2 litros)` y un único enlace que funciona.
- **Formato** (negritas, títulos, citas): se queda el texto sin las marcas. No se pierde ninguna palabra.
- **Listas**: igual, con sus casillas.
- **Escenarios → etiquetas**: mismos nombres, iconos, orden y notas asignadas. Para ti todo queda igual, solo cambia el nombre.
- **Las etiquetas antiguas** (las que no usabas): desaparecen de la pantalla, pero si alguna nota tenía alguna se conserva oculta en los datos y la búsqueda la sigue encontrando. No se ha borrado nada.

---

## 4. Contraseñas: ninguna en texto claro

- La dirección del puente, la clave del puente y la contraseña de copias se guardan **juntas y cifradas** (AES-GCM) en `localStorage['nl_pte']`, con una **clave del dispositivo no extraíble** en IndexedDB `nl_pte_db`.
- **Ninguna viaja por la red**: la clave del puente firma las peticiones y la contraseña de copias cifra los datos **antes** de salir del dispositivo.
- En Drive solo hay archivos `.gdc` **cifrados** (cabecera `NLENC1`). Ni Google ni nadie con acceso a tu Drive puede leer tus notas.

**Comprobado**: tras conectar, he buscado la dirección, la clave y la contraseña en todo localStorage y en todas las bases IndexedDB, y **no aparecen**.

### Parámetros (fila nueva de la tabla de «usados»)

| App | Prefijo SPX | Claves propias | Carpeta Drive | Cabecera MG | Caché SW |
|---|---|---|---|---|---|
| Gestor de notas 5.0 | `nl` | `nl_pte` (localStorage, cifrado), `nl_pte_db` (IndexedDB, clave del dispositivo), IndexedDB `notario_v3` | `Mi unidad/Apps/Backups/notasylistas` | `NLENC1\n` | `gestornotas-` |

Bloque SP literal, cambiando solo `SPX`, `DAPP` y `MG`. Parámetros criptográficos sin tocar.

---

## 5. Sincronización entre el PC y el móvil (lo nuevo)

Usa **el mismo puente**, sin tocar tu Apps Script. En cada dispositivo, **al abrir la app, al volver a ella y unos 8 segundos después de cada cambio**:

1. Mira la copia más reciente de `Apps/Backups/notasylistas`.
2. Si la subió otro dispositivo, la descarga y la descifra.
3. **Mezcla nota a nota**: de cada nota gana la versión más reciente, y lo borrado en un dispositivo se borra en el otro.
4. Si hay algo nuevo, sube la mezcla cifrada.

El **☁️ de arriba** indica el estado: punto verde (sincronizado), naranja (pendiente o en curso) o rojo (error; al tocarlo te dice qué pasa). Tócalo para sincronizar al momento.

**A tener en cuenta**

- No es instantáneo como Keep: unos segundos, o lo que tardes en abrir la app en el otro dispositivo.
- **La contraseña de copias debe ser la misma en todos los dispositivos.** Si no lo es, el ☁️ se pone rojo y te lo dice. No se mezcla nada.
- **Cada sincronización con cambios sube una copia** y el puente conserva las últimas 10. Te recomiendo subir «Conservar en Drive las últimas» a **30** (Ajustes → tarjeta de Drive) para tener más historial.
- **Con sincronización activa no sale el aviso de copia al entrar**: cada sincronización ya es una copia en Drive. Sin Drive, el aviso sale como siempre (1 mes o 1 cambio, configurable).
- **Restaurar una copia antigua en un dispositivo sincronizado**: lo restaurado se mezcla después con lo que hay en Drive (no reaparece lo que borraste en otro dispositivo).

---

## 6. Resto de mejoras implementadas

| Mejora | Cómo se usa |
|---|---|
| **Escribir arriba, al estilo Keep** | Caja «Escribe una nota…» en la lista. Se guarda al pulsar Guardar, al tocar fuera o con Ctrl+Enter. Va a la etiqueta en la que estés |
| **📋 Pegar** | Botón abajo: lo que tengas copiado se guarda como nota nueva. La primera vez el navegador pide permiso; si no puede leerlo, te deja pegarlo en la caja |
| **Compartir a la app (Android)** | Con la app instalada, en «Compartir» de Chrome, YouTube… aparece **Notas**. Un toque y el enlace queda guardado. En iPhone no está disponible: es una limitación de Apple |
| **⧉ Copiar** en cada nota | Copia el título y el texto (o la lista con ☐/☑) sin abrir la nota |
| **Texto sencillo con enlaces pulsables** | Sin editor de formato (la causa del fallo). En el editor, los enlaces de la nota aparecen debajo para abrirlos |
| **Etiquetas** (antes escenarios) | Pestañas arriba; en Ajustes se crean, renombran, ordenan y borran. Borrar una etiqueta no borra sus notas |
| **Cuadrícula en el PC** | Con pantalla ancha, varias columnas como Keep |
| **Aviso de enlace repetido** | Al guardar un enlace que ya está en otra nota te avisa, con el botón «Ver» |
| **Listas cómodas** | Enter crea el siguiente elemento; borrar en un elemento vacío lo elimina |
| **💡 Ideas de mejora** | En Ajustes: añadir (con saltos de línea), marcar como implementada, editar y borrar. Se sincronizan |
| **PWA** | Instalable, funciona sin conexión, icono propio |

### Errores corregidos

| Error de la 4.2 | Ahora |
|---|---|
| Cada edición multiplicaba las barras invertidas y rompía los enlaces | Texto sencillo; notas existentes limpiadas |
| Una nota con un bloque de código podía **ejecutar código** | Todo se pinta como texto: imposible ejecutar nada (probado) |
| Pasar una nota a lista **borraba su texto** sin avisar | Nota ↔ lista convierte las líneas en elementos y al revés (los marcados se escriben con ✓) |
| Una lista que se quedaba vacía volvía a ser nota | El tipo se guarda aparte |
| **Escape** cerraba el editor perdiendo cambios | Pregunta antes de descartar |
| Importar sustituía todo sin copia previa | Restaurar comprueba la copia entera, descarga una copia previa (cifrada si hay contraseña) y sustituye en una sola operación. Acepta copias `.gdc`, las de la 5.0 y las JSON de la 4.2 |
| Sin conexión no arrancaba (Dexie desde internet) | Funciona sin conexión |

---

## 7. Desinstalar la PWA

- La app **nunca** vacía localStorage entero ni borra bases de otras apps. El `sw.js` solo borra cachés `gestornotas-` y solo atiende archivos de su carpeta.
- **Android**: al desinstalar se quita el icono y **los datos se quedan**.
- **Ordenador**: **no marques «Borrar también los datos de Chrome»** (borraría todo el dominio, es decir, todas tus apps).
- **iPhone**: cada app de la pantalla de inicio tiene su propio almacenamiento; al borrarla se borra solo lo suyo.

Con la sincronización activa, aunque pierdas un dispositivo, tus notas siguen en Drive (cifradas) y en el otro dispositivo.

---

## 8. Pruebas realizadas

Con una base **idéntica a la que crea Dexie** (40 notas, notas con el fallo de las barras, enlaces anidados, formato, bloque de código malicioso, listas, papelera, colores, fijadas, etiquetas antiguas, 2 escenarios, ajustes en localStorage):

| Prueba | Resultado |
|---|---|
| Abre la misma base, añade 2 almacenes sin tocar los existentes | ✅ |
| 40 notas conservadas; copia interna idéntica al original | ✅ |
| Barras y enlaces anidados limpiados; formato quitado sin perder texto | ✅ |
| Bloque de código malicioso → se ve como texto, no se ejecuta | ✅ |
| Escenarios → etiquetas (mismos nombres, iconos y orden) | ✅ |
| Tema y tamaño de letra migrados; claves genéricas de localStorage sin borrar | ✅ |
| Nota rápida + aviso de enlace repetido | ✅ |
| Nota → lista → nota sin perder nada (marcados con ✓) | ✅ |
| Escape con cambios → pregunta | ✅ |
| Contraseñas en texto claro en localStorage o IndexedDB | ✅ ninguna |
| Restaurar una copia de la 4.2 (con el texto estropeado) → se limpia; copia previa cifrada | ✅ |
| **Sincronización con un puente simulado y dos dispositivos**: el PC sube; el móvil (con una nota propia) recibe todo y sube la suya; el PC recibe la del móvil; una edición en el PC llega al móvil; un borrado definitivo en el móvil desaparece del PC; los dos quedan iguales | ✅ |
| Copias en Drive cifradas (`NLENC1`) | ✅ |
| Dispositivo con otra contraseña de copias → aviso claro, no mezcla nada | ✅ |
| Errores en consola | ✅ ninguno |

**Pendiente (solo tú):** la conexión real con Google, que desde aquí no es posible. En el PC: Ajustes → Conectar con Drive → «Probar y guardar» (debe decir `Apps/Backups/notasylistas`). Lo mismo en el móvil, y comprobar que una nota escrita en uno aparece en el otro (abre la app o toca ☁️).

---

## 9. Mejoras NO implementadas (para decidir)

1. **Importar desde Google Keep** (Google Takeout exporta tus notas de Keep en JSON). Te traería de golpe todo lo que tengas allí, con etiquetas y listas. Muy recomendable si quieres dejar Keep del todo.
2. **Importar desde Evernote** (archivo `.enex`), por si queda algo útil de aquella época.
3. **Archivar** notas (como Keep): quitarlas de la vista sin mandarlas a la papelera.
4. **Recordatorios** con fecha y hora. Una PWA no puede avisar de forma fiable con la app cerrada; se podría mostrar «Para hoy» al abrir.
5. **Ordenar a mano** (arrastrar notas) además de fijarlas.
6. **Fotos en las notas**. No lo recomiendo: engordan mucho cada sincronización.
7. **Sincronización más inmediata**: bajar la espera de 8 s, o sincronizar al cerrar la app. A cambio, más copias en Drive.
