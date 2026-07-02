import { AppLayout } from "../../../../app/layout/AppLayout";
import { useNavigate, useParams } from "react-router-dom";
import {
  findEquipmentDetailById,
  getEquipmentDetailSummary,
} from "../../mocks/equipment-details.mock";
import { DetailSummaryCards } from "../../components/DetailSummaryCards";
import { DetailsHeader } from "../../components/DetailsHeader";
import { EquipmentHistoryCard } from "../../components/EquipmentHistoryCard";
import { EquipmentInfoCard } from "../../components/EquipmentInfoCard";
import { EquipmentNotesCard } from "../../components/EquipmentNotesCard";
import {
  Container,
  ContentGrid,
  MainColumn,
  SideColumn,
  StarterBox,
} from "./styles";

export function EquipmentDetailsPage() {
  const navigate = useNavigate();
  const { equipmentId } = useParams();
  const equipment = findEquipmentDetailById(equipmentId);
  if (!equipment) {
    return (
      <AppLayout currentPage="Detalhes">
        <Container>
          <StarterBox>Equipamento não encontrado.</StarterBox>
        </Container>
      </AppLayout>
    );
  }
  const summaries = getEquipmentDetailSummary(equipment);

  return (
    <AppLayout currentPage="Detalhes">
      <Container>
        {/* <StarterBox>
          AULA 06: esta página está pronta para ser conectada aos mocks de
          detalhe. O passo a passo está em
          frontend/docs/aula-06/README-alunos.md.
        </StarterBox> */}
        {/*
          AULA 06 - roteiro de implementação:

          1. Importar useNavigate e useParams de react-router-dom.
          2. Importar findEquipmentDetailById e getEquipmentDetailSummary.
          3. Importar os componentes DetailsHeader, DetailSummaryCards,
             EquipmentInfoCard, EquipmentNotesCard e EquipmentHistoryCard.
          4. Ler o equipmentId da URL.
          5. Buscar o equipamento no mock.
          6. Montar os cards de resumo a partir do equipamento.
          7. Renderizar o layout de detalhes.

          O README dos alunos mostra o código de cada etapa.
        */}{" "}
        <DetailsHeader
          equipment={equipment}
          onBack={() => navigate("/equipment")}
          onEdit={() => undefined}
          onChangeStatus={() => undefined}
          onRemove={() => undefined}
        />
        
        <DetailSummaryCards summaries={summaries} />

        <ContentGrid>
          <MainColumn>
            <EquipmentInfoCard equipment={equipment} />
            <EquipmentNotesCard notes={equipment.notes} />
          </MainColumn>
          <SideColumn>
            <EquipmentHistoryCard history={equipment.history} />
          </SideColumn>
        </ContentGrid>
      </Container>
    </AppLayout>
  );
}
