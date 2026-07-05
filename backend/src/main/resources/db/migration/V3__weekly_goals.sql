-- Simplify goals to weekly goals: one title assigned to one week, done or not.
-- Old goal data (category/unit/target/week-range) is dropped (development phase).

drop table if exists goals cascade;

create table goals (
    id          uuid primary key,
    quarter_id  uuid not null,
    title       varchar(120) not null,
    week        integer not null,
    done        boolean not null,
    created_at  timestamptz not null,
    updated_at  timestamptz not null
);
create index idx_goal_quarter on goals (quarter_id);
