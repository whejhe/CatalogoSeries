// src/stores/series.js
import { defineStore } from 'pinia'
import { supabase } from '../supabase' // Asegúrate de que esta importación sea correcta

export const useSeriesStore = defineStore('series', {
  state: () => ({
    allSeries: [],
    loading: false,
    error: null,
  }),
  actions: {
    /**
     * @description Obtiene todas las series de la base de datos.
     */
    async fetchSeries() {
      this.loading = true
      this.error = null
      try {
        const { data, error } = await supabase
          .from('series')
          .select('*')
          .order('titulo', { ascending: true }) // Ordena por título

        if (error) throw error
        this.allSeries = data
      } catch (err) {
        this.error = err.message
        console.error('Error al cargar series:', err.message)
      } finally {
        this.loading = false
      }
    },

    /**
     * @description Obtiene una serie específica por su ID.
     * @param {string} id - El ID de la serie a buscar.
     * @returns {Object|null} La serie encontrada o null si no existe.
     */
    async fetchSerieById(id) {
      this.loading = true
      this.error = null
      try {
        const { data, error } = await supabase.from('series').select('*').eq('id', id).single() // Usa .single() para esperar un solo resultado

        // PGRST116 es el código de error de Supabase si no se encuentran filas, no es un error de consulta real
        if (error && error.code !== 'PGRST116') {
          throw error
        }

        return data // Devuelve la serie o null si no se encontró (data será null con PGRST116)
      } catch (err) {
        this.error = err.message
        console.error(`Error al cargar serie con ID ${id}:`, err.message)
        return null
      } finally {
        this.loading = false
      }
    },

    /**
     * @description Añade una nueva serie a la base de datos.
     * @param {Object} serieData - Los datos de la serie a añadir, incluyendo trailer_url.
     */
    async addSerie(serieData) {
      this.loading = true
      this.error = null
      try {
        const { data, error } = await supabase.from('series').insert([serieData]).select()

        if (error) throw error

        if (data && data.length > 0) {
          this.allSeries.push(data[0]) // Añadir la nueva serie a la lista
        }
        return true
      } catch (err) {
        this.error = err.message
        console.error('Error al añadir serie:', err.message)
        return false
      } finally {
        this.loading = false
      }
    },

    /**
     * @description Actualiza una serie existente.
     * @param {string} id - El ID de la serie a actualizar.
     * @param {Object} updatedData - Los nuevos datos de la serie.
     */
    async updateSerie(id, updatedData) {
      this.loading = true
      this.error = null
      try {
        const { data, error } = await supabase
          .from('series')
          .update(updatedData)
          .eq('id', id)
          .select()

        if (error) throw error

        // Actualizar la serie en el estado local
        const index = this.allSeries.findIndex((s) => s.id === id)
        if (index !== -1 && data && data.length > 0) {
          this.allSeries[index] = data[0]
        }
        return true
      } catch (err) {
        this.error = err.message
        console.error('Error al actualizar serie:', err.message)
        return false
      } finally {
        this.loading = false
      }
    },

    /**
     * @description Elimina una serie por su ID.
     * @param {string} id - El ID de la serie a eliminar.
     */
    async deleteSerie(id) {
      this.loading = true
      this.error = null
      try {
        const { error } = await supabase.from('series').delete().eq('id', id)

        if (error) throw error

        // Eliminar la serie del estado local
        this.allSeries = this.allSeries.filter((s) => s.id !== id)
        return true
      } catch (err) {
        this.error = err.message
        console.error('Error al eliminar serie:', err.message)
        return false
      } finally {
        this.loading = false
      }
    },
  },
})
