use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct ToolSchema {
    pub name: String,
    pub description: String,
    pub parameters: serde_json::Value,
}

pub fn get_available_tools() -> Vec<ToolSchema> {
    vec![
        ToolSchema {
            name: "get_ticket_details".into(),
            description: "Fetch issue details from the issue tracker".into(),
            parameters: serde_json::json!({
                "type": "object",
                "properties": {
                    "ticket_id": {
                        "type": "string",
                        "description": "The ID of the ticket to fetch.",
                    }
                },
                "required": ["ticket_id"]
            }),
        },
        ToolSchema {
            name: "read_local_file".into(),
            description: "Read the contents of a local file".into(),
            parameters: serde_json::json!({
                "type": "object",
                "properties": {
                    "filepath": {
                        "type": "string"
                    }
                },
                "required": ["filepath"]
            }),
        },
        ToolSchema {
            name: "request_cli_execution".into(),
            description: "Propose a command line strictly awaiting user security approval".into(),
            parameters: serde_json::json!({
                "type": "object",
                "properties": {
                    "command": {
                        "type": "string"
                    }
                },
                "required": ["command"]
            }),
        }
    ]
}

// In a real application, the orchestrator loop goes here,
// interacting with a given LLM API backend via reqwest.
// It tracks conversation states parsing the text output
// and pausing / responding to tool calls based on their schema names. 
