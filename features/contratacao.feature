Feature: Registrar contratação de trabalhador

  Scenario: Contratação bem-sucedida — atualizar status do trabalhador
    Given que o trabalhador com CPF "300400500-60" está encaminhado
    When a empresa confirma a contratação
    Then o status do trabalhador é atualizado para "CONTRATADO"
    And as informações são persistidas no sistema

  Scenario: Consultar trabalhadores contratados
    Given que existem trabalhadores cadastrados no sistema
    When o atendente consulta a lista de trabalhadores
    Then o sistema retorna a listagem com sucesso
