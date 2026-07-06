import ArrowBackOutlined from '@mui/icons-material/ArrowBackOutlined'
import AutorenewOutlined from '@mui/icons-material/AutorenewOutlined'
import DeleteOutlineOutlined from '@mui/icons-material/DeleteOutlineOutlined'
import EditOutlined from '@mui/icons-material/EditOutlined'
import { Alert, App as AntDesignApp, Button, Spin } from 'antd'
import type { TableProps } from 'antd'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppLayout } from '../../../../app/layout/AppLayout'
import { DataTable } from '../../../../shared/components/DataTable'
import { PageHeader } from '../../../../shared/components/PageHeader'
import {
  SummaryCards,
  type SummaryCardItem,
} from '../../../../shared/components/SummaryCards'
import { getRequestErrorMessage } from '../../../../shared/http/getRequestErrorMessage'
import {
  getEquipmentStatusLabel,
  getEquipmentTypeLabel,
  type EquipmentStatus,
} from '../../../equipment/types/equipment'
import {
  LocationFormModal,
  type LocationFormValues,
} from '../../components/LocationFormModal'
import { LocationRemoveModal } from '../../components/LocationRemoveModal'
import {
  LocationStatusModal,
  type LocationStatusFormValues,
} from '../../components/LocationStatusModal'
import { useDeleteLocation } from '../../hooks/useDeleteLocation'
import { useLocationDetails } from '../../hooks/useLocationDetails'
import { useLocationEquipment } from '../../hooks/useLocationEquipment'
import { useLocationHistory } from '../../hooks/useLocationHistory'
import { useUpdateLocation } from '../../hooks/useUpdateLocation'
import { useUpdateLocationStatus } from '../../hooks/useUpdateLocationStatus'
import {
  formatLocationDate,
  getLocationStatusLabel,
  getLocationTypeLabel,
  locationStatusOptions,
  locationTypeOptions,
  type CreateLocationPayload,
  type LocationDetails,
  type LocationEquipment,
  type LocationHistoryItem,
} from '../../types/location'
import {
  CardTitle,
  Container,
  ContentGrid,
  DescriptionList,
  DescriptionText,
  Detail,
  HeaderActions,
  InfoCard,
  StarterBox,
  Term,
  Value,
} from './styles'

const linkedEquipmentPageSize = 5
const historyPageSize = 5

function buildLocationPayload(values: LocationFormValues): CreateLocationPayload {
  return {
    code: values.code.trim().toUpperCase(),
    name: values.name.trim(),
    type: values.type!,
    building: values.building?.trim() || undefined,
    floor: values.floor?.trim() || undefined,
    room: values.room?.trim() || undefined,
    description: values.description?.trim() || null,
    status: values.status,
  }
}

function buildSummaryCards(location: LocationDetails): SummaryCardItem[] {
  return [
    {
      id: 'total',
      title: 'Equipamentos',
      value: location.equipmentSummary.total,
      icon: 'total',
      lineColor: 'linear-gradient(90deg, #002A64, #007C8C)',
      iconBackground: '#E1E8FD',
    },
    {
      id: 'available',
      title: 'Disponíveis',
      value: location.equipmentSummary.available,
      icon: 'available',
      lineColor: '#25B8A7',
      iconBackground: '#E6FFFB',
    },
    {
      id: 'maintenance',
      title: 'Manutenção',
      value: location.equipmentSummary.inMaintenance,
      icon: 'maintenance',
      lineColor: '#007C8C',
      iconBackground: '#E6F4FF',
    },
    {
      id: 'inactive',
      title: 'Inativos',
      value: location.equipmentSummary.inactive,
      icon: 'inactive',
      lineColor: '#6B7280',
      iconBackground: '#F3F4F6',
    },
  ]
}

const equipmentColumns: TableProps<LocationEquipment>['columns'] = [
  {
    title: 'Equipamento',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Tipo',
    dataIndex: 'type',
    key: 'type',
    render: (type: LocationEquipment['type']) => getEquipmentTypeLabel(type),
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    render: (status: EquipmentStatus) => getEquipmentStatusLabel(status),
  },
  {
    title: 'Atualizado',
    dataIndex: 'updatedAt',
    key: 'updatedAt',
    render: (updatedAt: string) => formatLocationDate(updatedAt),
  },
]

const historyColumns: TableProps<LocationHistoryItem>['columns'] = [
  {
    title: 'Movimentação',
    dataIndex: 'title',
    key: 'title',
  },
  {
    title: 'Descrição',
    dataIndex: 'description',
    key: 'description',
  },
  {
    title: 'Data',
    dataIndex: 'createdAt',
    key: 'createdAt',
    render: (createdAt: string) => formatLocationDate(createdAt),
  },
]

export function LocationDetailsPage() {
  const { message: messageApi } = AntDesignApp.useApp()
  const navigate = useNavigate()
  const { locationId } = useParams()
  const [equipmentPage, setEquipmentPage] = useState(1)
  const [historyPage, setHistoryPage] = useState(1)
  const [locationInForm, setLocationInForm] = useState<LocationDetails>()
  const [locationInStatus, setLocationInStatus] = useState<LocationDetails>()
  const [locationToRemove, setLocationToRemove] = useState<LocationDetails>()

  const locationQuery = useLocationDetails(locationId)
  const equipmentQuery = useLocationEquipment(locationId, {
    page: equipmentPage,
    pageSize: linkedEquipmentPageSize,
  })
  const historyQuery = useLocationHistory(locationId, {
    page: historyPage,
    pageSize: historyPageSize,
  })
  const updateLocation = useUpdateLocation()
  const updateLocationStatus = useUpdateLocationStatus()
  const deleteLocation = useDeleteLocation()

  const location = locationQuery.data
  const linkedEquipment = equipmentQuery.data?.data ?? []
  const equipmentPagination = equipmentQuery.data?.meta
  const history = historyQuery.data?.data ?? []
  const historyPagination = historyQuery.data?.meta
  const isLoading = locationQuery.isLoading
  const loadError =
    (!locationId ? 'ID do local não encontrado na rota.' : '') ||
    locationQuery.errorMessage
  const tableError = equipmentQuery.errorMessage || historyQuery.errorMessage
  const isSavingForm = updateLocation.isLoading
  const isSavingStatus = updateLocationStatus.isLoading
  const isRemovingLocation = deleteLocation.isLoading

  async function handleSubmitForm(values: LocationFormValues) {
    if (!locationInForm) {
      return
    }

    try {
      await updateLocation.update({
        locationId: locationInForm.id,
        payload: buildLocationPayload(values),
      })
      await locationQuery.reload()
      messageApi.success('Local atualizado com sucesso.')
      setLocationInForm(undefined)
    } catch (error) {
      messageApi.error(getRequestErrorMessage(error))
    }
  }

  async function handleSubmitStatus(values: LocationStatusFormValues) {
    if (!locationInStatus) {
      return
    }

    try {
      await updateLocationStatus.updateStatus({
        locationId: locationInStatus.id,
        payload: {
          status: values.status,
          note: values.note?.trim() || null,
        },
      })
      await locationQuery.reload()
      messageApi.success('Situação atualizada com sucesso.')
      setLocationInStatus(undefined)
    } catch (error) {
      messageApi.error(getRequestErrorMessage(error))
    }
  }

  async function handleConfirmRemove() {
    if (!locationToRemove) {
      return
    }

    try {
      await deleteLocation.remove(locationToRemove.id)
      messageApi.success('Local excluído com sucesso.')
      setLocationToRemove(undefined)
      navigate('/locations')
    } catch (error) {
      messageApi.error(getRequestErrorMessage(error))
    }
  }

  if (isLoading) {
    return (
      <AppLayout currentPage="Localizações">
        <Container>
          <StarterBox>
            <Spin /> Carregando local...
          </StarterBox>
        </Container>
      </AppLayout>
    )
  }

  if (loadError || !location) {
    return (
      <AppLayout currentPage="Localizações">
        <Container>
          <Alert
            showIcon
            message="Local não encontrado"
            description={loadError || 'Não foi possível exibir este local.'}
            type="error"
          />
        </Container>
      </AppLayout>
    )
  }

  return (
    <AppLayout currentPage="Localizações">
      <Container>
        <PageHeader
          actionIcon={<ArrowBackOutlined fontSize="small" />}
          actionLabel="Voltar"
          description={`${location.code} - ${getLocationTypeLabel(location.type)}`}
          title={location.name}
          onAction={() => navigate('/locations')}
        />

        <HeaderActions>
          <Button icon={<EditOutlined fontSize="small" />} onClick={() => setLocationInForm(location)}>
            Editar
          </Button>
          <Button
            icon={<AutorenewOutlined fontSize="small" />}
            onClick={() => setLocationInStatus(location)}
          >
            Mudar situação
          </Button>
          <Button
            danger
            icon={<DeleteOutlineOutlined fontSize="small" />}
            onClick={() => setLocationToRemove(location)}
          >
            Excluir
          </Button>
        </HeaderActions>

        <SummaryCards
          ariaLabel="Resumo dos equipamentos do local"
          summaries={buildSummaryCards(location)}
        />

        {tableError && (
          <Alert
            showIcon
            message="Erro ao carregar dados relacionados"
            description={tableError}
            type="error"
          />
        )}

        <ContentGrid>
          <InfoCard styles={{ body: { padding: 24 } }}>
            <CardTitle>Informações gerais</CardTitle>

            <DescriptionList>
              <Detail>
                <Term>Código</Term>
                <Value>{location.code}</Value>
              </Detail>
              <Detail>
                <Term>Situação</Term>
                <Value>{getLocationStatusLabel(location.status)}</Value>
              </Detail>
              <Detail>
                <Term>Prédio</Term>
                <Value>{location.building ?? 'Não informado'}</Value>
              </Detail>
              <Detail>
                <Term>Andar</Term>
                <Value>{location.floor ?? 'Não informado'}</Value>
              </Detail>
              <Detail>
                <Term>Sala</Term>
                <Value>{location.room ?? 'Não informado'}</Value>
              </Detail>
              <Detail>
                <Term>Atualizado</Term>
                <Value>{formatLocationDate(location.updatedAt)}</Value>
              </Detail>
            </DescriptionList>

            <DescriptionText>
              {location.description ?? 'Sem descrição cadastrada.'}
            </DescriptionText>
          </InfoCard>

          <InfoCard styles={{ body: { padding: 24 } }}>
            <CardTitle>Histórico de movimentações</CardTitle>
            <DataTable
              columns={historyColumns}
              dataSource={history}
              emptyText="Nenhuma movimentação encontrada."
              loading={historyQuery.isLoading}
              pagination={{
                current: historyPage,
                pageSize: historyPageSize,
                total: historyPagination?.total ?? 0,
                onChange: (page) => setHistoryPage(page),
              }}
              rowKey="id"
            />
          </InfoCard>
        </ContentGrid>

        <InfoCard styles={{ body: { padding: 24 } }}>
          <CardTitle>Equipamentos vinculados</CardTitle>
          <DataTable
            columns={equipmentColumns}
            dataSource={linkedEquipment}
            emptyText="Nenhum equipamento vinculado."
            loading={equipmentQuery.isLoading}
            pagination={{
              current: equipmentPage,
              pageSize: linkedEquipmentPageSize,
              total: equipmentPagination?.total ?? 0,
              onChange: (page) => setEquipmentPage(page),
            }}
            rowKey="id"
          />
        </InfoCard>

        <LocationFormModal
          confirmLoading={isSavingForm}
          location={locationInForm}
          mode="edit"
          open={Boolean(locationInForm)}
          statusOptions={locationStatusOptions}
          typeOptions={locationTypeOptions}
          onCancel={() => setLocationInForm(undefined)}
          onSubmit={handleSubmitForm}
        />

        <LocationStatusModal
          confirmLoading={isSavingStatus}
          location={locationInStatus}
          open={Boolean(locationInStatus)}
          statusOptions={locationStatusOptions}
          onCancel={() => setLocationInStatus(undefined)}
          onSubmit={handleSubmitStatus}
        />

        <LocationRemoveModal
          confirmLoading={isRemovingLocation}
          location={locationToRemove}
          open={Boolean(locationToRemove)}
          onCancel={() => setLocationToRemove(undefined)}
          onConfirm={handleConfirmRemove}
        />
      </Container>
    </AppLayout>
  )
}
