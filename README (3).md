# Banco de dados do Vitta

O Vitta utiliza o **Cloud Firestore** para persistir dados em coleções de documentos e o **Firebase Authentication** para autenticar usuários. A configuração do Firebase na aplicação está em [frontend/src/services/firebase.ts](../frontend/src/services/firebase.ts).

| Área | Coleções identificadas no código |
| --- | --- |
| Contas e perfis | `usuarios`, `admins`, `filhos`, `convites_responsaveis` |
| Rotina de cuidados | `medicamentos`, `consultas`, `exames` |
| Organização de arquivos | `documentos`, `pastas` |
| Comunicação e suporte | `notificacoes`, `notificacoes_admin`, `chats`, `suporte` |
| Registros técnicos | `logs` |

A aplicação acessa as coleções pelo SDK do Firebase. A configuração do banco é feita no Firebase, sem importar scripts SQL. O [DER planejado](../design/diagramas/der-planejado.jpg) documenta a modelagem apresentada no trabalho escrito.
