// src/services/storageService.js
import { supabase } from '../supabase'
import { v4 as uuidv4 } from 'uuid'

const BUCKET_NAME = 'user-avatars' // Define el nombre de tu bucket de Supabase Storage aquí
const AVATAR_FOLDER = 'avatars' // La subcarpeta dentro del bucket para avatares

/**
 * @description Sube un archivo al bucket de Supabase Storage.
 * Genera un nombre de archivo único utilizando UUID.
 * @param {File} file - El archivo a subir.
 * @param {string} userId - El ID del usuario asociado, para la estructura de carpetas.
 * @returns {Promise<string|null>} La URL pública del archivo subido si es exitoso, o null si falla.
 */
export async function uploadFile(file, userId) {
  if (!file || !userId) {
    console.error('uploadFile: Archivo o ID de usuario no proporcionado.')
    return null
  }

  const fileExtension = file.name.split('.').pop()
  const fileName = `${uuidv4()}.${fileExtension}`
  // La ruta del archivo dentro del bucket será: "avatars/[userId]/[uuid].ext"
  const filePath = `${AVATAR_FOLDER}/${userId}/${fileName}`

  try {
    const { data, error } = await supabase.storage.from(BUCKET_NAME).upload(filePath, file, {
      cacheControl: '3600', // 1 hora de caché
      upsert: false, // No sobrescribir si ya existe (usamos UUID para evitar esto)
    })

    if (error) {
      console.error('storageService: Error al subir el archivo:', error.message)
      throw error
    }

    // Obtener la URL pública del archivo subido
    const { data: publicUrlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath)

    if (publicUrlData.publicUrl) {
      console.log('storageService: Archivo subido con éxito. URL:', publicUrlData.publicUrl)
      return publicUrlData.publicUrl
    } else {
      console.error('storageService: No se pudo obtener la URL pública del archivo.')
      return null
    }
  } catch (error) {
    console.error('storageService: Error en uploadFile:', error.message)
    return null
  }
}

/**
 * @description Elimina un archivo del bucket de Supabase Storage.
 * Extrae la ruta del archivo de la URL pública.
 * @param {string} fileUrl - La URL pública del archivo a eliminar.
 * @returns {Promise<boolean>} True si la eliminación fue exitosa, false si hubo error o la URL es inválida.
 */
export async function deleteFile(fileUrl) {
  if (
    !fileUrl ||
    typeof fileUrl !== 'string' ||
    !fileUrl.includes('supabase.co/storage/v1/object/public/')
  ) {
    console.warn(
      'deleteFile: URL de archivo inválida o no de Supabase Storage. Saltando eliminación.',
      fileUrl,
    )
    return false
  }

  let pathInBucket = ''
  try {
    // Extrae la parte de la ruta después de /public/{bucketName}/
    // Ejemplo: https://[project_id].supabase.co/storage/v1/object/public/user-avatars/avatars/user_id/uuid.png
    // Necesitamos: avatars/user_id/uuid.png
    const urlParts = fileUrl.split(`/public/${BUCKET_NAME}/`)
    if (urlParts.length > 1) {
      pathInBucket = urlParts[1]
    } else {
      console.warn('deleteFile: No se pudo parsear la ruta del archivo del bucket.')
      return false
    }
  } catch (e) {
    console.error('deleteFile: Error al parsear URL de archivo:', e.message)
    return false
  }

  if (!pathInBucket) {
    console.warn('deleteFile: Ruta de archivo vacía después de parsear. Saltando eliminación.')
    return false
  }

  try {
    const { error } = await supabase.storage.from(BUCKET_NAME).remove([pathInBucket]) // remove espera un array de rutas

    if (error) {
      // Supabase Storage remove devuelve error si el archivo no existe (código 404),
      // lo cual puede ser esperado si ya fue borrado. Lo tratamos como éxito en ese caso.
      if (
        error.message.includes('The resource was not found') ||
        error.message.includes('not found')
      ) {
        console.warn(
          `deleteFile: Archivo no encontrado en Storage (quizás ya fue borrado): ${pathInBucket}`,
        )
        return true
      }
      console.error('storageService: Error al intentar eliminar el archivo:', error.message)
      throw error // Re-lanzar otros errores
    }
    console.log(`storageService: Archivo eliminado del Storage: ${pathInBucket}`)
    return true
  } catch (error) {
    console.error('storageService: Error en deleteFile:', error.message)
    return false
  }
}

/**
 * @description Genera la URL pública de un archivo en el bucket.
 * NOTA: Esta función es menos usada si `uploadFile` ya devuelve la URL.
 * Puede ser útil si solo tienes la ruta interna y necesitas la URL pública.
 * @param {string} filePath - La ruta interna del archivo dentro del bucket (ej. 'avatars/user_id/image.png').
 * @returns {string|null} La URL pública del archivo, o null si la ruta es inválida.
 */
export function getPublicUrl(filePath) {
  if (!filePath) {
    console.warn('getPublicUrl: Ruta de archivo no proporcionada.')
    return null
  }
  try {
    const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath)
    return data.publicUrl
  } catch (error) {
    console.error('storageService: Error al obtener URL pública:', error.message)
    return null
  }
}
