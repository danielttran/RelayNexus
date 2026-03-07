use super::{Issue, TicketProvider};
use async_trait::async_trait;
use reqwest::{Client, header};
use serde::Deserialize;

pub struct RedmineAdapter {
    url: String,
    api_key: String,
    client: Client,
}

impl RedmineAdapter {
    pub fn new(url: String, api_key: String) -> Self {
        Self {
            url,
            api_key,
            client: Client::new(),
        }
    }
}

#[derive(Deserialize)]
struct RedmineIssueResponse {
    issue: RedmineIssueData,
}

#[derive(Deserialize)]
struct RedmineIssueData {
    id: u64,
    subject: String,
    description: Option<String>,
    status: RedmineStatus,
    assigned_to: Option<RedmineUser>,
}

#[derive(Deserialize)]
struct RedmineStatus {
    name: String,
}

#[derive(Deserialize)]
struct RedmineUser {
    name: String,
}

#[async_trait]
impl TicketProvider for RedmineAdapter {
    async fn fetch_issue(&self, id: &str) -> Result<Issue, String> {
        let endpoint = format!("{}/issues/{}.json", self.url.trim_end_matches('/'), id);
        
        let response = self.client.get(&endpoint)
            .header("X-Redmine-API-Key", &self.api_key)
            .send()
            .await
            .map_err(|e| e.to_string())?;

        if !response.status().is_success() {
            return Err(format!("Failed to fetch issue: HTTP {}", response.status()));
        }

        let data: RedmineIssueResponse = response.json().await.map_err(|e| e.to_string())?;

        Ok(Issue {
            id: data.issue.id.to_string(),
            title: data.issue.subject,
            description: data.issue.description,
            status: data.issue.status.name,
            assignee: data.issue.assigned_to.map(|u| u.name),
        })
    }

    async fn update_status(&self, _id: &str, _status: &str) -> Result<(), String> {
        // To be implemented based on Redmine workflow IDs 
        Err("Update status not yet implemented for Redmine".into())
    }

    async fn add_comment(&self, id: &str, text: &str) -> Result<(), String> {
        let endpoint = format!("{}/issues/{}.json", self.url.trim_end_matches('/'), id);
        
        let payload = serde_json::json!({
            "issue": {
                "notes": text
            }
        });

        let response = self.client.put(&endpoint)
            .header("X-Redmine-API-Key", &self.api_key)
            .json(&payload)
            .send()
            .await
            .map_err(|e| e.to_string())?;

        if !response.status().is_success() {
            return Err(format!("Failed to add comment: HTTP {}", response.status()));
        }

        Ok(())
    }
}
