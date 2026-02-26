-- Criação da tabela de Listas
CREATE TABLE public.lists (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ativar RLS na tabela lists
ALTER TABLE public.lists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver suas próprias listas" ON public.lists
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir suas próprias listas" ON public.lists
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias listas" ON public.lists
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas próprias listas" ON public.lists
    FOR DELETE USING (auth.uid() = user_id);


-- Criação da tabela de Tarefas
CREATE TABLE public.tasks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  list_id uuid REFERENCES public.lists(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  status text DEFAULT 'pending'::text NOT NULL,
  priority text DEFAULT 'medium'::text NOT NULL,
  due_date date,
  order_index integer DEFAULT 0 NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ativar RLS na tabela tasks
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver suas próprias tarefas" ON public.tasks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir suas próprias tarefas" ON public.tasks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias tarefas" ON public.tasks
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas próprias tarefas" ON public.tasks
    FOR DELETE USING (auth.uid() = user_id);
