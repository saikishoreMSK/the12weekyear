-- User (or guest) feedback, surfaced in the admin panel. user_id is nullable so guests (no account)
-- can leave feedback too.
create table feedback (
    id          uuid primary key,
    user_id     uuid,
    message     varchar(2000) not null,
    rating      integer,
    created_at  timestamptz not null
);
create index idx_feedback_user on feedback (user_id);
create index idx_feedback_created on feedback (created_at);
