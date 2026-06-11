Feature: Registrar atendimento de seguro-desemprego

  Scenario: Registro de atendimento de seguro-desemprego
    Given que o atendente está na tela de assistência
    When registra um atendimento de tipo "SEGURO_DESEMPREGO" para "Pedro Alves"
    Then o atendimento é registrado com sucesso
    And o tipo do atendimento é "SEGURO_DESEMPREGO"

  Scenario: Listar atendimentos registrados
    Given que existem atendimentos cadastrados no sistema
    When o atendente consulta a lista de atendimentos
    Then o sistema retorna os atendimentos cadastrados
