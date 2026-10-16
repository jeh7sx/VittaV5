export interface UsuarioComunidade {
  id: string;
  nome: string;
  email?: string;
  foto?: string | null;
  bio?: string;
  filhoNome?: string; // Ex: "Mãe do Pedro"
}

export interface PostInsta {
  id: string;
  userId: string;
  userName: string;
  userPhoto?: string | null;
  text: string;
  imageUrl?: string | null;
  tag?: string;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
}

export interface MensagemDirect {
  id: string;
  senderId: string;
  text: string;
  createdAt: any;
}

export interface ConversaDirect {
  id: string; // Ex: uid1_uid2
  participantes: string[];
  participantesInfo: {
    [uid: string]: {
      nome: string;
      foto?: string | null;
    };
  };
  ultimaMensagem: string;
  ultimaMensagemSenderId: string;
  updatedAt: any;
}