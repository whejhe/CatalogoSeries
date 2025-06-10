// src/stores/series.js
import { defineStore } from 'pinia'
import { supabase } from '../supabase' // Asegúrate de que esta ruta sea correcta

export const useSeriesStore = defineStore('series', {
  state: () => ({
    series: [], // Aquí almacenaremos el listado de series
    currentSerie: null, // Para cuando editemos o veamos una serie específica
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
          .select('*') // Selecciona todas las columnas
          .order('titulo', { ascending: true }) // Ordena por título alfabéticamente

        if (error) throw error

        this.series = data
        console.log('Series cargadas:', this.series)
      } catch (error) {
        this.error = error.message
        console.error('Error al cargar las series:', error.message)
      } finally {
        this.loading = false
      }
    },

    /**
     * @description Obtiene una serie específica por su ID.
     * @param {string} id - El UUID de la serie a obtener.
     */
    async fetchSerieById(id) {
      this.loading = true
      this.error = null
      try {
        const { data, error } = await supabase
          .from('series')
          .select('*')
          .eq('id', id) // Filtra por el ID de la serie
          .single() // Espera un único resultado

        if (error) throw error

        this.currentSerie = data
        console.log('Serie específica cargada:', this.currentSerie)
      } catch (error) {
        this.error = error.message
        console.error(`Error al cargar la serie con ID ${id}:`, error.message)
      } finally {
        this.loading = false
      }
    },

    /**
     * @description Añade una nueva serie a la base de datos.
     * @param {object} serieData - Objeto con los datos de la nueva serie.
     */
    async addSerie(serieData) {
      this.loading = true
      this.error = null
      try {
        const { data, error } = await supabase.from('series').insert([serieData]).select().single()

        if (error) throw error

        this.series.push(data) // Añade la nueva serie al estado local
        console.log('Serie añadida con éxito:', data)
        return true
      } catch (error) {
        this.error = error.message
        console.error('Error al añadir la serie:', error.message)
        return false
      } finally {
        this.loading = false
      }
    },

    /**
     * @description Actualiza una serie existente en la base de datos.
     * @param {string} id - El UUID de la serie a actualizar.
     * @param {object} updatedData - Objeto con los datos a actualizar.
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
          .single()

        if (error) throw error

        const index = this.series.findIndex((s) => s.id === id)
        if (index !== -1) {
          this.series[index] = data
        }
        this.currentSerie = data
        console.log('Serie actualizada con éxito:', data)
        return true
      } catch (error) {
        this.error = error.message
        console.error(`Error al actualizar la serie con ID ${id}:`, error.message)
        return false
      } finally {
        this.loading = false
      }
    },

    /**
     * @description Elimina una serie de la base de datos.
     * @param {string} id - El UUID de la serie a eliminar.
     */
    async deleteSerie(id) {
      this.loading = true
      this.error = null
      try {
        const { error } = await supabase.from('series').delete().eq('id', id)

        if (error) throw error

        this.series = this.series.filter((s) => s.id !== id)
        if (this.currentSerie && this.currentSerie.id === id) {
          this.currentSerie = null
        }
        console.log(`Serie con ID ${id} eliminada con éxito.`)
        return true
      } catch (error) {
        this.error = error.message
        console.error(`Error al eliminar la serie con ID ${id}:`, error.message)
        return false
      } finally {
        this.loading = false
      }
    },
  },

  getters: {
    /**
     * @returns {Array} Un array de todas las series disponibles.
     */
    allSeries: (state) => state.series,
  },
})
