Feature: Registrar contratação de trabalhador

  Scenario: Contratação bem-sucedida
    Given que existe um trabalhador encaminhado para uma vaga
    When a empresa registra a contratação
    Then o status do encaminhamento é atualizado para "CONTRATADO"
    And o status do trabalhador é atualizado para "CONTRATADO"
    And uma notificação de contratação é enviada
    And a vaga é marcada como "PREENCHIDA"

  Scenario: Rejeição de trabalhador encaminhado
    Given que existe um trabalhador encaminhado para uma vaga
    When a empresa registra a rejeição
    Then o status do encaminhamento é atualizado para "REJEITADO"
    And o status do trabalhador retorna para "ATIVO"
    And uma notificação de rejeição é enviada ao trabalhador

  Scenario: Atualizar informações de contratação
    Given que existe um trabalhador com status "CONTRATADO"
    When os dados de contratação são atualizados
    Then as informações são persistidas no sistema
    And um histórico de atualização é registrado
