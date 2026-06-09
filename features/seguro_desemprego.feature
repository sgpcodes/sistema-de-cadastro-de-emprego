Feature: Registrar seguro-desemprego

  Scenario: Cadastro bem-sucedido de seguro-desemprego
    Given que o trabalhador está desempregado
    When preenche os dados do seguro: data de início, valor, número de parcelas
    And clica em "Registrar Seguro"
    Then o seguro é registrado no sistema
    And o status é marcado como "ATIVO"
    And o trabalhador recebe confirmação

  Scenario: Consultar parcelas do seguro
    Given que o trabalhador tem um seguro ativo
    When acessa a página de consulta de seguro
    Then o sistema exibe: data de início, parcelas restantes, valor de cada parcela
    And exibe o histórico de parcelas pagas

  Scenario: Cancelar seguro-desemprego antes do término
    Given que o trabalhador foi contratado
    When o sistema detecta uma contratação
    Then o seguro é automaticamente cancelado
    And o trabalhador recebe notificação
    And o status é alterado para "CANCELADO"

  Scenario: Registrar parcela de seguro recebida
    Given que o trabalhador recebeu uma parcela
    When registra o recebimento no sistema
    Then a parcela é marcada como "RECEBIDA"
    And o número de parcelas restantes é atualizado
