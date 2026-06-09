Feature: Autenticar usuário

  Scenario: Login bem-sucedido
    Given que o usuário está na página de login
    When preenche o email "usuario@example.com"
    And preenche a senha "senha123"
    And clica no botão "Entrar"
    Then o usuário é autenticado
    And um token JWT é gerado
    And o usuário é redirecionado para o dashboard

  Scenario: Falha ao fazer login com email inválido
    Given que o usuário está na página de login
    When preenche um email inexistente
    And preenche uma senha
    And clica no botão "Entrar"
    Then o sistema exibe uma mensagem de erro
    And o usuário não é autenticado

  Scenario: Falha ao fazer login com senha incorreta
    Given que existe um usuário cadastrado
    When preenche o email correto
    And preenche uma senha incorreta
    And clica no botão "Entrar"
    Then o sistema exibe uma mensagem de erro
    And o usuário não é autenticado

  Scenario: Logout bem-sucedido
    Given que o usuário está autenticado
    When clica no botão "Sair"
    Then o token JWT é removido
    And o usuário é redirecionado para a página de login
    And a sessão é encerrada
