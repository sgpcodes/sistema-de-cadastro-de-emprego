Feature: Encaminhar trabalhador para vaga

  Scenario: Encaminhamento bem-sucedido
    Given que existe um trabalhador cadastrado com CPF "12345678901"
    And que existe uma vaga disponível para o cargo "Desenvolvedor"
    When o atendente realiza o encaminhamento
    Then o sistema registra o encaminhamento
    And o status do trabalhador é atualizado para "ENCAMINHADO"
    And uma notificação é enviada ao trabalhador

  Scenario: Falha ao encaminhar trabalhador inativo
    Given que existe um trabalhador cadastrado com status "INATIVO"
    And que existe uma vaga disponível
    When o atendente tenta encaminhar o trabalhador
    Then o sistema exibe uma mensagem de erro
    And o encaminhamento não é registrado

  Scenario: Falha ao encaminhar para vaga preenchida
    Given que existe um trabalhador cadastrado
    And que existe uma vaga com status "PREENCHIDA"
    When o atendente tenta encaminhar o trabalhador
    Then o sistema exibe uma mensagem de erro
    And o encaminhamento não é registrado
