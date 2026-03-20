-- 1. settlement_tasks 테이블 생성
create table if not exists settlement_tasks (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  assignee text not null,
  status text not null check (status in ('pending', 'completed')),
  category text not null,
  due_date date not null,
  completed_date date,
  updated_at timestamp with time zone default now()
);

-- 2. 초기 데이터 삽입 (Seed Data)
insert into settlement_tasks (id, title, assignee, status, category, due_date, completed_date)
values 
  (gen_random_uuid(), '1월 정산 기초 자료 검토', '이상준', 'completed', '기초자료', '2026-01-31', '2026-01-25'),
  (gen_random_uuid(), '원가 정산 데이터 확정', '이정희', 'pending', '데이터확정', '2026-01-31', null),
  (gen_random_uuid(), '외부 파트너사 세금계산서 발행', '이상준', 'pending', '세무', '2026-02-05', null),
  (gen_random_uuid(), '미정산 잔액 확인 및 보고', '박지민', 'completed', '보고', '2026-01-28', '2026-01-27'),
  (gen_random_uuid(), '카드 매출 전표 대조', '이정희', 'pending', '데이터확정', '2026-02-01', null),
  (gen_random_uuid(), '수수료 정산 내역 검증', '이상준', 'pending', '검증', '2026-02-03', null),
  (gen_random_uuid(), '정산 결과 리포트 작성', '김철수', 'pending', '보고', '2026-02-10', null);

-- 3. 실시간 업데이트 활성화 (Optional)
alter publication supabase_realtime add table settlement_tasks;
