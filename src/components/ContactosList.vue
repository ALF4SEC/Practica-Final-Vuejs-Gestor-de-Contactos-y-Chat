<template>
  <div class="p-4">
    <Card>
      <template #title>
        <div class="flex justify-content-between align-items-center">
          <div class="flex align-items-center gap-2">
            <i class="pi pi-list"></i>
            <span>Lista de Contactos</span>
          </div>
          <Button 
            label="Nuevo Contacto" 
            icon="pi pi-plus" 
            @click="navegarNuevo"
          />
        </div>
      </template>
      <template #content>
        <span class="p-input-icon-left mb-3">
          <i class="pi pi-search" />
          <InputText 
            v-model="filtroTexto" 
            placeholder="Buscar por nombre o email..." 
            class="w-full"
          />
        </span>

        <div class="grid mb-3">
          <div class="col-12 md:col-4">
            <div class="surface-card p-3 border-round">
              <div class="flex align-items-center gap-2">
                <i class="pi pi-users text-xl"></i>
                <div>
                  <div class="text-2xl font-bold">{{ totalContactos }}</div>
                  <div class="text-sm text-500">Total Contactos</div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-12 md:col-4">
            <div class="surface-card p-3 border-round">
              <div class="flex align-items-center gap-2">
                <i class="pi pi-star-fill text-xl" style="color: #fbbf24;"></i>
                <div>
                  <div class="text-2xl font-bold">{{ totalFavoritos }}</div>
                  <div class="text-sm text-500">Favoritos</div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-12 md:col-4">
            <div class="surface-card p-3 border-round">
              <div class="flex align-items-center gap-2">
                <i class="pi pi-check-circle text-xl" style="color: #10b981;"></i>
                <div>
                  <div class="text-2xl font-bold">{{ contactosActivos.length }}</div>
                  <div class="text-sm text-500">Activos</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DataTable 
          :value="contactosFiltrados" 
          stripedRows 
          :paginator="true" 
          :rows="10"
          responsiveLayout="scroll"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
          :rowsPerPageOptions="[5,10,20]"
        >
          <Column field="nombre" header="Nombre" sortable>
            <template #body="slotProps">
              <div class="flex align-items-center gap-2">
                <i class="pi pi-user"></i>
                <strong>{{ slotProps.data.nombre }}</strong>
              </div>
            </template>
          </Column>
          <Column field="email" header="Email" sortable>
            <template #body="slotProps">
              <div class="flex align-items-center gap-2">
                <i class="pi pi-envelope"></i>
                <span>{{ slotProps.data.email }}</span>
              </div>
            </template>
          </Column>
          <Column field="telefono" header="Teléfono">
            <template #body="slotProps">
              <div class="flex align-items-center gap-2">
                <i class="pi pi-phone"></i>
                <span>{{ slotProps.data.telefono || 'N/A' }}</span>
              </div>
            </template>
          </Column>
          <Column field="estado" header="Estado" sortable>
            <template #body="slotProps">
              <Tag 
                :value="slotProps.data.estado" 
                :severity="slotProps.data.estado === 'Activo' ? 'success' : 'danger'"
                rounded
              />
            </template>
          </Column>
          <Column field="favorito" header="Favorito" style="text-align: center;">
            <template #body="slotProps">
              <i 
                :class="slotProps.data.favorito ? 'pi pi-star-fill' : 'pi pi-star'" 
                :style="{ color: slotProps.data.favorito ? '#fbbf24' : '#cbd5e1', fontSize: '1.2rem' }"
              ></i>
            </template>
          </Column>
          <Column header="Acciones">
            <template #body="slotProps">
              <div class="flex gap-2">
                <Button 
                  icon="pi pi-eye" 
                  severity="info" 
                  @click="verDetalle(slotProps.data.id)"
                  v-tooltip.top="'Ver detalle'"
                  text
                  rounded
                  :aria-label="`Ver detalle de ${slotProps.data.nombre}`"
                />
                <Button 
                  icon="pi pi-pencil" 
                  severity="warning" 
                  @click="editarContacto(slotProps.data.id)"
                  v-tooltip.top="'Editar'"
                  text
                  rounded
                  :aria-label="`Editar ${slotProps.data.nombre}`"
                />
                <Button 
                  icon="pi pi-trash" 
                  severity="danger" 
                  @click="confirmarEliminar(slotProps.data)"
                  v-tooltip.top="'Eliminar'"
                  text
                  rounded
                  :aria-label="`Eliminar ${slotProps.data.nombre}`"
                />
              </div>
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>

    <ConfirmDialog></ConfirmDialog>
    <Toast />
  </div>
</template>

<script setup>
import Button from 'primevue/button'
import Card from 'primevue/card'
import Column from 'primevue/column'
import ConfirmDialog from 'primevue/confirmdialog'
import DataTable from 'primevue/datatable'
import Tag from 'primevue/tag'
import Toast from 'primevue/toast'
import InputText from 'primevue/inputtext' // NUEVO: Para el buscador
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import { computed, ref } from 'vue' // NUEVO: añadido ref
import { useRouter } from 'vue-router'
import { useContactosStore } from '../stores/contactosStore'

const router = useRouter()
const confirm = useConfirm()
const toast = useToast()
const store = useContactosStore()

// NUEVO: Estado del filtro de búsqueda
const filtroTexto = ref('')

// NUEVO: Computed para filtrar contactos por nombre y email
const contactosFiltrados = computed(() => {
  if (!filtroTexto.value.trim()) {
    return store.contactos
  }
  
  const textoLower = filtroTexto.value.toLowerCase().trim()
  return store.contactos.filter(c => 
    c.nombre.toLowerCase().includes(textoLower) ||
    c.email.toLowerCase().includes(textoLower)
  )
})

const contactos = computed(() => store.contactos)
const totalContactos = computed(() => store.totalContactos)
const totalFavoritos = computed(() => store.totalFavoritos)
const contactosActivos = computed(() => store.contactosActivos)

const navegarNuevo = () => {
  router.push('/contactos/nuevo')
}

const verDetalle = (id) => {
  router.push(`/contactos/${id}`)
}

const editarContacto = (id) => {
  router.push(`/contactos/${id}/editar`)
}

const confirmarEliminar = (contacto) => {
  confirm.require({
    message: `¿Estás seguro de eliminar el contacto "${contacto.nombre}"?`,
    header: 'Confirmar eliminación',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Sí, eliminar',
    rejectLabel: 'Cancelar',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await store.eliminarContacto(contacto.id)
        toast.add({
          severity: 'success',
          summary: 'Contacto eliminado',
          detail: `El contacto "${contacto.nombre}" ha sido eliminado correctamente`,
          life: 3000
        })
      } catch (error) {
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo eliminar el contacto',
          life: 3000
        })
      }
    }
  })
}
</script>
