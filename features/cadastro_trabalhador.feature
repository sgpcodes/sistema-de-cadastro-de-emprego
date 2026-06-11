Feature: Cadastrar trabalhador no sistema

  Scenario: Cadastro bem-sucedido com dados válidos
    Given que o atendente está na tela de cadastro de trabalhador
    When preenche o nome "Carlos Eduardo Mendes"
    And preenche o CPF "111.222.333-44"
    And preenche o telefone "(11) 98765-4321"
    And clica em Salvar Trabalhador
    Then o trabalhador é cadastrado com sucesso
    And o trabalhador aparece na listagem

  Scenario: Falha ao cadastrar com CPF duplicado
    Given que existe um trabalhador cadastrado com CPF "555.666.777-88"
    When tenta cadastrar outro trabalhador com o mesmo CPF
    Then o sistema exibe erro de CPF duplicado
    And o segundo cadastro não é salvo
