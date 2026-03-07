pub mod redmine_adapter;

use async_trait::async_trait;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Issue {
    pub id: String,
    pub title: String,
    pub description: Option<String>,
    pub status: String,
    pub assignee: Option<String>,
}

#[async_trait]
pub trait TicketProvider: Send + Sync {
    async fn fetch_issue(&self, id: &str) -> Result<Issue, String>;
    async fn update_status(&self, id: &str, status: &str) -> Result<(), String>;
    async fn add_comment(&self, id: &str, text: &str) -> Result<(), String>;
}

pub struct ProviderRegistry {
    provider: Option<Box<dyn TicketProvider>>,
}

impl ProviderRegistry {
    pub fn new() -> Self {
        Self { provider: None }
    }

    pub fn set_provider(&mut self, provider: Box<dyn TicketProvider>) {
        self.provider = Some(provider);
    }
    
    pub fn get_provider(&self) -> Option<&dyn TicketProvider> {
        self.provider.as_deref()
    }
}
