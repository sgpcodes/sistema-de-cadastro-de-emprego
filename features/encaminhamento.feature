Feature: Encaminhar trabalhador para vaga

  Scenario: Registro de encaminhamento bem-sucedido
    Given que existe um trabalhador disponível com CPF "100200300-40"
    And que existe uma vaga aberta com ID registrado
    When o atendente registra o encaminhamento do trabalhador para a vaga
    Then o encaminhamento é salvo com status "PENDENTE"

  Scenario: Atualizar status do trabalhador para encaminhado
    Given que o trabalhador com CPF "200300400-50" está disponível
    When o atendente atualiza o status do trabalhador para "ENCAMINHADO"
    Then o trabalhador é atualizado com sucesso
    And o novo status do trabalhador é "ENCAMINHADO"
