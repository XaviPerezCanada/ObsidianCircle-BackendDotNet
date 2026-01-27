import { gameRoomService, type CreateGameRoomRequest, type UpdateGameRoomRequest } from '@/src/services/sala.service'


/**
 * Comandos de negocio para GameRooms - Operaciones de escritura (CQRS)
 * Estas funciones modifican el estado en el servidor
 */
export const gameRoomCommands = {
  /**
   * Crea una nueva sala
   */
  create: async (data: CreateGameRoomRequest): Promise<{ slug: string }> => {
    try {
      return await gameRoomService.create(data)
    } catch (error: any) {
      console.error('Error en command create:', error)
      throw error
    }
  },

  /**
   * Actualiza una sala existente
   */
  update: async (slug: string, data: UpdateGameRoomRequest): Promise<void> => {
    try {
      if (!slug) {
        throw new Error('Slug es requerido')
      }
      await gameRoomService.update(slug, data)
    } catch (error: any) {
      console.error('Error en command update:', error)
      throw error
    }
  },

  /**
   * Activa una sala
   */
  activate: async (slug: string): Promise<void> => {
    try {
      if (!slug) {
        throw new Error('Slug es requerido')
      }
      await gameRoomService.activate(slug)
    } catch (error: any) {
      console.error('Error en command activate:', error)
      throw error
    }
  },

  /**
   * Desactiva una sala
   */
  deactivate: async (slug: string): Promise<void> => {
    try {
      if (!slug) {
        throw new Error('Slug es requerido')
      }
      await gameRoomService.deactivate(slug)
    } catch (error: any) {
      console.error('Error en command deactivate:', error)
      throw error
    }
  },

  /**
   * Pone una sala en modo mantenimiento
   */
  setMaintenance: async (slug: string): Promise<void> => {
    try {
      if (!slug) {
        throw new Error('Slug es requerido')
      }
      await gameRoomService.setMaintenance(slug)
    } catch (error: any) {
      console.error('Error en command setMaintenance:', error)
      throw error
    }
  },

  /**
   * Elimina físicamente una sala
   */
  delete: async (slug: string): Promise<void> => {
    try {
      if (!slug) {
        throw new Error('Slug es requerido')
      }
      await gameRoomService.delete(slug)
    } catch (error: any) {
      console.error('Error en command delete:', error)
      throw error
    }
  }
}

/**
 * Comandos de prueba para GameRooms
 * Ejecuta estos comandos en la consola del navegador para probar el servicio
 * Ejemplo: window.testGameRooms.getAll()
 */
export const testGameRooms = {
    /**
     * Obtiene todas las salas del servidor
     * Muestra en consola la respuesta completa y un resumen
     */
    getAll: async () => {
        console.group('🔍 Test: Obtener todas las salas')
        try {
        const startTime = performance.now()
        const rooms = await gameRoomService.getAll()
        const endTime = performance.now()
        
        console.log('✅ Respuesta del servidor:', rooms)
        console.log('📊 Resumen:')
        console.table(rooms.map(r => ({
            id: r.id,
            name: r.name,
            slug: r.slug,
            capacity: r.capacity,
            status: r.status,
            description: r.description || '(vacío)'
        })))
        
        console.log(`\n📈 Estadísticas:`)
        console.log(`  - Total salas: ${rooms.length}`)
        console.log(`  - Activas: ${rooms.filter(r => r.status === 'Active').length}`)
        console.log(`  - Inactivas: ${rooms.filter(r => r.status === 'Inactive').length}`)
        console.log(`  - En mantenimiento: ${rooms.filter(r => r.status === 'UnderMaintenance').length}`)
        console.log(`  - Tiempo de respuesta: ${(endTime - startTime).toFixed(2)}ms`)
        
        console.log('\n📋 Estructura de datos recibida:')
        if (rooms.length > 0) {
            console.log('Ejemplo de sala:', JSON.stringify(rooms[0], null, 2))
        }
        
        return rooms
        } catch (error: any) {
        console.error('❌ Error al obtener salas:', error)
        console.error('Detalles del error:', {
            message: error?.message,
            status: error?.response?.status,
            statusText: error?.response?.statusText,
            data: error?.response?.data,
            url: error?.config?.url,
            method: error?.config?.method
        })
        throw error
        } finally {
        console.groupEnd()
        }
    },

    /**
     * Obtiene solo las salas disponibles (activas o en mantenimiento)
     */
    getAvailable: async () => {
        console.group('🔍 Test: Obtener salas disponibles')
        try {
        const startTime = performance.now()
        const rooms = await gameRoomService.getAvailable()
        const endTime = performance.now()
        
        console.log('✅ Salas disponibles:', rooms)
        console.table(rooms.map(r => ({
            name: r.name,
            slug: r.slug,
            capacity: r.capacity,
            status: r.status
        })))
        
        console.log(`\n📈 Total salas disponibles: ${rooms.length}`)
        console.log(`⏱️ Tiempo de respuesta: ${(endTime - startTime).toFixed(2)}ms`)
        
        return rooms
        } catch (error: any) {
        console.error('❌ Error:', error)
        console.error('Detalles:', error?.response?.data)
        throw error
        } finally {
        console.groupEnd()
        }
    },

    /**
     * Obtiene una sala específica por su slug
     * @param slug - El slug de la sala a buscar
     */
    getBySlug: async (slug: string) => {
        console.group(`🔍 Test: Obtener sala por slug "${slug}"`)
        try {
        if (!slug) {
            console.warn('⚠️ Por favor proporciona un slug')
            console.log('Ejemplo: testGameRooms.getBySlug("sala-principal")')
            return
        }
        
        const startTime = performance.now()
        const room = await gameRoomService.getBySlug(slug)
        const endTime = performance.now()
        
        console.log('✅ Sala encontrada:', room)
        console.log('\n📋 Detalles completos:')
        console.log(JSON.stringify(room, null, 2))
        
        console.log(`\n⏱️ Tiempo de respuesta: ${(endTime - startTime).toFixed(2)}ms`)
        
        return room
        } catch (error: any) {
        console.error('❌ Error:', error)
        console.error('Detalles:', {
            status: error?.response?.status,
            data: error?.response?.data,
            message: error?.message
        })
        throw error
        } finally {
        console.groupEnd()
        }
    },

    /**
     * Crea una nueva sala de prueba
     * @param data - Datos de la sala a crear (opcional, usa valores por defecto si no se proporciona)
     */
    create: async (data?: CreateGameRoomRequest) => {
        console.group('🔍 Test: Crear nueva sala')
        try {
        const testData: CreateGameRoomRequest = data || {
            name: `Sala de Prueba ${Date.now()}`,
            capacity: 10,
            description: 'Sala creada desde el comando de prueba'
        }
        
        console.log('📤 Enviando datos:', testData)
        
        const startTime = performance.now()
        const result = await gameRoomService.create(testData)
        const endTime = performance.now()
        
        console.log('✅ Sala creada exitosamente!')
        console.log('📥 Respuesta del servidor:', result)
        console.log(`🔗 Slug generado: ${result.slug}`)
        console.log(`⏱️ Tiempo de respuesta: ${(endTime - startTime).toFixed(2)}ms`)
        
        // Obtener la sala recién creada para verificar
        console.log('\n🔍 Verificando sala creada...')
        const createdRoom = await gameRoomService.getBySlug(result.slug)
        console.log('✅ Sala verificada:', createdRoom)
        
        return result
        } catch (error: any) {
        console.error('❌ Error al crear sala:', error)
        console.error('Detalles:', {
            status: error?.response?.status,
            data: error?.response?.data,
            requestData: error?.config?.data
        })
        throw error
        } finally {
        console.groupEnd()
        }
    },

    /**
     * Actualiza una sala existente
     * @param slug - Slug de la sala a actualizar
     * @param data - Datos a actualizar (opcional)
     */
    update: async (slug: string, data?: UpdateGameRoomRequest) => {
        console.group(`🔍 Test: Actualizar sala "${slug}"`)
        try {
        if (!slug) {
            console.warn('⚠️ Por favor proporciona un slug')
            return
        }
        
        // Primero obtener la sala actual
        const currentRoom = await gameRoomService.getBySlug(slug)
        console.log('📋 Sala actual:', currentRoom)
        
        const updateData: UpdateGameRoomRequest = data || {
            name: `${currentRoom.name} (Actualizada)`,
            capacity: currentRoom.capacity + 1,
            description: `${currentRoom.description} - Actualizada el ${new Date().toLocaleString()}`
        }
        
        console.log('📤 Datos a actualizar:', updateData)
        
        const startTime = performance.now()
        await gameRoomService.update(slug, updateData)
        const endTime = performance.now()
        
        console.log('✅ Sala actualizada exitosamente!')
        console.log(`⏱️ Tiempo de respuesta: ${(endTime - startTime).toFixed(2)}ms`)
        
        // Verificar la actualización
        console.log('\n🔍 Verificando actualización...')
        const updatedRoom = await gameRoomService.getBySlug(slug)
        console.log('✅ Sala actualizada:', updatedRoom)
        
        return updatedRoom
        } catch (error: any) {
        console.error('❌ Error al actualizar:', error)
        console.error('Detalles:', error?.response?.data)
        throw error
        } finally {
        console.groupEnd()
        }
    },

    /**
     * Activa una sala
     * @param slug - Slug de la sala a activar
     */
    activate: async (slug: string) => {
        console.group(`🔍 Test: Activar sala "${slug}"`)
        try {
        if (!slug) {
            console.warn('⚠️ Por favor proporciona un slug')
            return
        }
        
        const before = await gameRoomService.getBySlug(slug)
        console.log('📋 Estado antes:', before.status)
        
        await gameRoomService.activate(slug)
        console.log('✅ Sala activada!')
        
        const after = await gameRoomService.getBySlug(slug)
        console.log('📋 Estado después:', after.status)
        
        return after
        } catch (error: any) {
        console.error('❌ Error:', error?.response?.data || error?.message)
        throw error
        } finally {
        console.groupEnd()
        }
    },

    /**
     * Desactiva una sala
     * @param slug - Slug de la sala a desactivar
     */
    deactivate: async (slug: string) => {
        console.group(`🔍 Test: Desactivar sala "${slug}"`)
        try {
        if (!slug) {
            console.warn('⚠️ Por favor proporciona un slug')
            return
        }
        
        const before = await gameRoomService.getBySlug(slug)
        console.log('📋 Estado antes:', before.status)
        
        await gameRoomService.deactivate(slug)
        console.log('✅ Sala desactivada!')
        
        const after = await gameRoomService.getBySlug(slug)
        console.log('📋 Estado después:', after.status)
        
        return after
        } catch (error: any) {
        console.error('❌ Error:', error?.response?.data || error?.message)
        throw error
        } finally {
        console.groupEnd()
        }
    },

    /**
     * Pone una sala en modo mantenimiento
     * @param slug - Slug de la sala
     */
    setMaintenance: async (slug: string) => {
        console.group(`🔍 Test: Poner en mantenimiento sala "${slug}"`)
        try {
        if (!slug) {
            console.warn('⚠️ Por favor proporciona un slug')
            return
        }
        
        const before = await gameRoomService.getBySlug(slug)
        console.log('📋 Estado antes:', before.status)
        
        await gameRoomService.setMaintenance(slug)
        
        
        const after = await gameRoomService.getBySlug(slug)
        
        
        return after
        } catch (error: any) {
        console.error('❌ Error:', error?.response?.data || error?.message)
        throw error
        } finally {
        console.groupEnd()
        }
    },

    /**
     * Elimina físicamente una sala de la base de datos
     * @param slug - Slug de la sala a eliminar
     */
    delete: async (slug: string) => {
        console.group(`🔍 Test: Eliminar sala "${slug}" (eliminación física)`)
        try {
        if (!slug) {
            console.warn('⚠️ Por favor proporciona un slug')
            return
        }
        
        const before = await gameRoomService.getBySlug(slug)
        console.log('📋 Sala antes de eliminar:', before)
        
        await gameRoomService.delete(slug)
        console.log('✅ Sala eliminada físicamente de la base de datos!')
        
        // Intentar obtener la sala después de eliminar (debería fallar con 404)
        try {
            const after = await gameRoomService.getBySlug(slug)
            console.warn('⚠️ La sala todavía existe:', after)
        } catch (notFoundError: any) {
            if (notFoundError?.response?.status === 404) {
            console.log('✅ Confirmado: La sala ya no existe (404 Not Found)')
            } else {
            throw notFoundError
            }
        }
        
        } catch (error: any) {
        console.error('❌ Error:', error?.response?.data || error?.message)
        throw error
        } finally {
        console.groupEnd()
        }
    },

    /**
     * Ejecuta todas las pruebas en secuencia
     */
    runAllTests: async () => {
        console.group('🧪 Ejecutando todas las pruebas de GameRooms')
        try {
        console.log('1️⃣ Obteniendo todas las salas...')
        const allRooms = await testGameRooms.getAll()
        
        if (allRooms.length === 0) {
            console.log('⚠️ No hay salas. Creando una sala de prueba...')
            await testGameRooms.create()
            console.log('✅ Sala de prueba creada. Ejecuta testGameRooms.getAll() de nuevo para verla.')
            return
        }
        
        const firstRoom = allRooms[0]
        console.log(`\n2️⃣ Obteniendo sala por slug: "${firstRoom.slug}"`)
        await testGameRooms.getBySlug(firstRoom.slug)
        
        console.log(`\n3️⃣ Obteniendo salas disponibles...`)
        await testGameRooms.getAvailable()
        
        console.log('\n✅ Todas las pruebas completadas!')
        console.log('\n💡 Pruebas adicionales que puedes ejecutar:')
        console.log('  - testGameRooms.create() - Crear una nueva sala')
        console.log('  - testGameRooms.update("slug-aqui", { name: "Nuevo nombre" }) - Actualizar una sala')
        console.log('  - testGameRooms.activate("slug-aqui") - Activar una sala')
        console.log('  - testGameRooms.deactivate("slug-aqui") - Desactivar una sala')
        console.log('  - testGameRooms.setMaintenance("slug-aqui") - Poner en mantenimiento')
        
        } catch (error) {
        console.error('❌ Error en las pruebas:', error)
        } finally {
        console.groupEnd()
        }
    }
    }

    // Hacer disponible globalmente para usar en la consola del navegador
    if (typeof window !== 'undefined') {
    ;(window as any).testGameRooms = testGameRooms
    console.log('✅ Comandos de prueba cargados!')
    console.log('💡 Usa window.testGameRooms o simplemente testGameRooms en la consola')
    console.log('📚 Ejemplos:')
    console.log('  - testGameRooms.getAll()')
    console.log('  - testGameRooms.getAvailable()')
    console.log('  - testGameRooms.getBySlug("sala-principal")')
    console.log('  - testGameRooms.create()')
    console.log('  - testGameRooms.runAllTests()')
    }
