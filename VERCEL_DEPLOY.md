# 🚀 Desplegar Backend en Vercel

Guía rápida para desplegar el backend en Vercel.

## 📋 Requisitos Previos

1. Cuenta en [Vercel](https://vercel.com)
2. Proyecto en GitHub (recomendado) o puedes subir directamente
3. Variables de entorno listas

## 🚀 Pasos para Desplegar

### Opción 1: Desde Vercel Dashboard (Recomendado)

1. **Ve a [vercel.com](https://vercel.com) e inicia sesión**

2. **Clic en "Add New Project"**

3. **Importa tu repositorio de GitHub**
   - Si no está conectado, conéctalo primero
   - Selecciona el repositorio con tu proyecto

4. **Configura el proyecto**:
   - **Framework Preset**: Other
   - **Root Directory**: `BACK` (¡IMPORTANTE!)
   - **Build Command**: (dejar vacío o `npm install`)
   - **Output Directory**: (dejar vacío)
   - **Install Command**: `npm install`

5. **Agrega Variables de Entorno**:
   - Clic en "Environment Variables"
   - Agrega:
     ```
     MONGODB_URI = mongodb+srv://jorgemillan01:N30B4tQPrVfBYt52@cluster0.ko1pg.mongodb.net/ventas_telegram?retryWrites=true&w=majority&authSource=admin
     NODE_ENV = production
     PORT = (Vercel lo maneja automáticamente)
     WEBHOOK_TOKEN = (opcional, tu token secreto)
     ```

6. **Clic en "Deploy"**

7. **Espera a que termine el despliegue** (2-3 minutos)

8. **Copia la URL** que te da Vercel (ej: `https://tu-proyecto.vercel.app`)

### Opción 2: Desde CLI

1. **Instala Vercel CLI**:
```bash
npm i -g vercel
```

2. **Navega a la carpeta BACK**:
```bash
cd BACK
```

3. **Inicia el despliegue**:
```bash
vercel
```

4. **Sigue las instrucciones**:
   - ¿Configurar proyecto? → **Sí**
   - ¿Qué nombre? → (presiona Enter)
   - ¿En qué directorio? → `./`
   - ¿Sobrescribir configuración? → **No**

5. **Agrega variables de entorno**:
```bash
vercel env add MONGODB_URI
# Pega tu URI de MongoDB cuando te lo pida

vercel env add NODE_ENV
# Escribe: production
```

6. **Despliega a producción**:
```bash
vercel --prod
```

## ✅ Verificar el Despliegue

Una vez desplegado, prueba estos endpoints:

1. **Health Check**:
```
https://tu-proyecto.vercel.app/api/health
```

2. **Obtener Productos**:
```
https://tu-proyecto.vercel.app/api/webhook/productos
```

3. **Raíz**:
```
https://tu-proyecto.vercel.app/
```

## 🔧 Configuración Post-Despliegue

### 1. Actualizar Frontend

Edita `FRONT/src/services/api.js` o agrega variable de entorno:

```javascript
// En Vercel Frontend, agrega:
VITE_API_URL = https://tu-backend.vercel.app
```

### 2. Actualizar n8n

En tus workflows de n8n, actualiza las URLs de los webhooks:

- Antes: `http://localhost:5000/api/webhook/venta`
- Ahora: `https://tu-backend.vercel.app/api/webhook/venta`

## 📝 Notas Importantes

### ⚠️ Limitaciones de Vercel Serverless:

1. **Cold Starts**: La primera petición puede tardar 1-2 segundos
2. **Timeout**: Máximo 10 segundos en plan gratuito, 60 en Pro
3. **Conexión MongoDB**: Se mantiene entre requests (gracias al pooling)

### ✅ Ventajas:

1. **Gratis** para empezar
2. **Auto-scaling** automático
3. **CDN global** incluido
4. **SSL** automático
5. **Deployments** instantáneos

## 🐛 Solución de Problemas

### Error: "Cannot find module"
- Verifica que `package.json` tenga todas las dependencias
- Asegúrate de que `type: "module"` esté en package.json

### Error: "MongoDB connection failed"
- Verifica que la URI esté correcta en variables de entorno
- Asegúrate de que tu IP esté permitida en MongoDB Atlas (o permite 0.0.0.0/0)

### Error: "Function timeout"
- Vercel tiene límite de tiempo
- Considera optimizar queries a MongoDB
- O usa Railway/Render para backend tradicional

### La conexión a MongoDB se pierde
- El código ya maneja reconexión automática
- Si persiste, verifica la URI y la configuración de MongoDB Atlas

## 🔄 Actualizar el Backend

Cada vez que hagas cambios:

1. **Push a GitHub** (si usas Git)
2. **Vercel detecta automáticamente** y redespliega
3. O ejecuta: `vercel --prod` desde la carpeta BACK

## 📊 Monitoreo

- Ve a tu dashboard de Vercel
- Revisa la pestaña "Functions" para ver logs
- Revisa "Analytics" para ver métricas

---

¡Listo! Tu backend está desplegado en Vercel. 🎉

