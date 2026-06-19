# BigQuery Release Notes Explorer

Una hermosa y premium aplicación web construida con Python Flask, HTML5 vanilla, JavaScript (ES6) y CSS3 que descarga el feed XML oficial de las Notas de Lanzamiento de BigQuery, las procesa dinámicamente y las presenta en una interfaz de línea de tiempo interactiva.

## Características principales

- **Consumo de feed en tiempo real**: Descarga los datos directamente desde el feed oficial de Google Cloud (`https://docs.cloud.google.com/feeds/bigquery-release-notes.xml`).
- **Línea de tiempo interactiva**: Organizada cronológicamente por día, listando de forma individual cada actualización de lanzamiento.
- **Segmentación Inteligente**: Divide las actualizaciones compuestas de un mismo día y las clasifica automáticamente según su tipo (`Feature`, `Fix`, `Changed`, `Deprecated`, `Announcement`).
- **Filtros rápidos**: Filtra las actualizaciones por su categoría haciendo clic en los chips laterales del menú.
- **Búsqueda dinámica y resaltado**: Busca palabras clave sobre la marcha. Las coincidencias se resaltan visualmente sin romper la estructura ni los enlaces HTML originales de las notas.
- **Panel de Estadísticas**: Gráficos de barras interactivos en el panel lateral que calculan y muestran la proporción de cada tipo de actualización en tiempo real basándose en los filtros activos.
- **Compartir en X / Twitter**: Un modal de redacción premium integrado en la app que permite:
  - Formatear el contenido de la nota para publicarla de manera óptima.
  - Recortar y truncar la descripción de forma segura para no exceder los 280 caracteres.
  - Visualizar una tarjeta de previsualización en tiempo real con estilo de publicación de X.
  - Un indicador circular de progreso SVG animado que muestra los caracteres restantes.
- **Manual Refresh con Spinner**: Botón de recarga en la cabecera que hace un bypass de la caché del servidor para buscar actualizaciones frescas al instante.
- **Diseño Premium**: Interfaz responsive construida sobre una paleta de colores oscuros inspirada en la nube, con fuentes modernas (Inter y Outfit), barras de desplazamiento personalizadas y animaciones suaves al pasar el mouse por las tarjetas.

## Estructura del proyecto

- **[app.py](file:///G:/DESARROLLO2026/cursoKagle/agy-cli-projects/bq-releases-notes/app.py)**: Servidor backend en Flask que descarga el XML del feed, segmenta el HTML con `BeautifulSoup` y gestiona el caché en memoria (5 minutos de expiración).
- **[templates/index.html](file:///G:/DESARROLLO2026/cursoKagle/agy-cli-projects/bq-releases-notes/templates/index.html)**: Plantilla HTML5 del frontend estructurada semánticamente.
- **[static/css/styles.css](file:///G:/DESARROLLO2026/cursoKagle/agy-cli-projects/bq-releases-notes/static/css/styles.css)**: Estilos CSS del tema oscuro, componentes interactivos y modal.
- **[static/js/app.js](file:///G:/DESARROLLO2026/cursoKagle/agy-cli-projects/bq-releases-notes/static/js/app.js)**: Lógica del cliente que maneja peticiones AJAX, búsqueda, resaltado de texto, filtrado de datos y modal de Twitter.
- **[requirements.txt](file:///G:/DESARROLLO2026/cursoKagle/agy-cli-projects/bq-releases-notes/requirements.txt)**: Dependencias del entorno de Python.
- **[.gitignore](file:///G:/DESARROLLO2026/cursoKagle/agy-cli-projects/bq-releases-notes/.gitignore)**: Configuración para ignorar el entorno virtual (`venv`), caché de Python e IDEs.

## Cómo ejecutar el proyecto

### 1. Activar el entorno virtual
* **En Windows (PowerShell)**:
  ```pwsh
  .\venv\Scripts\Activate.ps1
  ```
* **En Linux/macOS**:
  ```bash
  source venv/bin/activate
  ```

### 2. Instalar dependencias
Asegúrate de tener las dependencias al día ejecutando:
```bash
pip install -r requirements.txt
```

### 3. Iniciar el servidor Flask
Corre la aplicación:
```bash
python app.py
```

### 4. Abrir en el navegador
Visita **[http://localhost:5000](http://localhost:5000)** en tu navegador web.
