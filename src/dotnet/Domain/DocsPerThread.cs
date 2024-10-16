﻿namespace Domain
{
    public class DocsPerThread
    {
        public string id { get; set; }
        public string ThreadId { get; set; }
        public string UserId { get; set; }
        public string DocumentName { get; set; }
        public bool Deleted { get; set; } = false;
        public bool AvailableInSearchIndex { get; set; } = false;

    }
}
