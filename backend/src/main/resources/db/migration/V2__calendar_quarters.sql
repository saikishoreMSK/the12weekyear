-- Pivot from floating 84-day cycles to fixed calendar quarters (Q1–Q4).
-- The old cycle/goal/review data is intentionally discarded (development phase); the users,
-- habits, habit_completions and otp tables are untouched.

drop table if exists weekly_reviews cascade;
drop table if exists goals cascade;
drop table if exists cycles cascade;

create table quarters (
    id              uuid primary key,
    user_id         uuid not null,
    year            integer not null,
    quarter_number  integer not null,
    title           varchar(120),
    objective       varchar(2000),
    created_at      timestamptz not null,
    updated_at      timestamptz not null,
    constraint uq_quarter_user_year_number unique (user_id, year, quarter_number)
);

create table goals (
    id             uuid primary key,
    quarter_id     uuid not null,
    category       varchar(50) not null,
    title          varchar(120) not null,
    unit           varchar(30) not null,
    target_value   integer not null,
    current_value  integer not null,
    week_start     integer not null,
    week_end       integer not null,
    created_at     timestamptz not null,
    updated_at     timestamptz not null
);
create index idx_goal_quarter on goals (quarter_id);

create table weekly_reviews (
    id               uuid primary key,
    user_id          uuid not null,
    quarter_id       uuid not null,
    week_number      integer not null,
    went_well        varchar(2000),
    wasted_time      varchar(2000),
    biggest_win      varchar(2000),
    biggest_blocker  varchar(2000),
    created_at       timestamptz not null,
    updated_at       timestamptz not null,
    constraint uq_review_quarter_week unique (quarter_id, week_number)
);
create index idx_review_quarter on weekly_reviews (quarter_id);
create index idx_review_user on weekly_reviews (user_id);
