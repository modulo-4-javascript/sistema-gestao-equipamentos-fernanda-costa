import { Card } from 'antd'
import styled from 'styled-components'

export const Container = styled.section`
  width: 100%;
  max-width: 1440px;
`

export const HeaderActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`

export const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(360px, 0.7fr);
  gap: 24px;

  @media (max-width: 1100px) {
    grid-template-columns: 1fr;
  }
`

export const InfoCard = styled(Card)`
  border-radius: 8px;
`

export const CardTitle = styled.h2`
  margin: 0 0 16px;
  color: #141b2b;
  font-size: 18px;
  font-weight: 700;
`

export const DescriptionList = styled.dl`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px 24px;
  margin: 0;

  @media (max-width: 700px) {
    grid-template-columns: 1fr;
  }
`

export const Detail = styled.div`
  min-width: 0;
`

export const Term = styled.dt`
  margin-bottom: 4px;
  color: #6b7280;
  font-size: 13px;
`

export const Value = styled.dd`
  margin: 0;
  color: #141b2b;
  font-size: 14px;
  font-weight: 600;
`

export const DescriptionText = styled.p`
  margin: 16px 0 0;
  color: #4b5563;
  font-size: 14px;
  line-height: 22px;
`

export const StarterBox = styled.div`
  padding: 24px;
  color: #6b7280;
  background: #ffffff;
  border: 1px dashed #b7c6d8;
  border-radius: 8px;
  font-size: 14px;
`
