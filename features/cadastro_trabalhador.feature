Feature: Cadastrar trabalhador no sistema

  Scenario: Cadastro bem-sucedido com todos os dados
    Given que o usuário está na página de cadastro de trabalhador
    When preenche os campos: CPF, Nome, Telefone, Email, Escolaridade, Profissão, Experiência
    And clica no botão "Cadastrar"
    Then o trabalhador é cadastrado no sistema
    And o status do trabalhador é "ATIVO"
    And uma confirmação é exibida

  Scenario: Falha ao cadastrar com CPF duplicado
    Given que existe um trabalhador com CPF "12345678901"
    When tenta cadastrar outro trabalhador com o mesmo CPF
    Then o sistema exibe uma mensagem de erro
    And o novo cadastro não é realizado

  Scenario: Validação de campos obrigatórios
    Given que o usuário está preenchendo o formulário
    When deixa campos obrigatórios em branco
    And clica em "Cadastrar"
    Then o sistema exibe mensagens de erro para os campos vazios
    And o cadastro não é realizado

  Scenario: Cadastro com dados incompletos mas válidos
    Given que o usuário preenche apenas os campos obrigatórios
    When clica em "Cadastrar"
    Then o trabalhador é cadastrado
    And campos opcionais podem ser preenchidos depois
